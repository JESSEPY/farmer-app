# Phone number login without SMS

The app accepts only Philippine phone number + password. Internally it normalizes
all supported number formats and uses a deterministic email-shaped Auth identifier:
`phone-639123456789@phone.kita-ani.invalid`. The reserved `.invalid` domain cannot
receive mail. Users never supply or see that identifier in account screens.
Supabase still handles passwords and sessions through Email/password authentication.
No Phone provider, SMS provider, OTP, SMTP setup, or real email is needed.

## Required Supabase settings

- Keep **Email** authentication enabled and allow new signups.
- Disable **Confirm email** before trying signup. Internal identifiers cannot receive
  confirmation messages. If confirmation is enabled, signup may create an unusable
  account and attempt a confirmation email; fix the setting and repair that account
  through admin tools before retrying.
- Leave the **Phone** provider disabled. No SMS provider is needed.
- Apply `supabase/migration-email-or-phone-auth.sql` once if not previously applied;
  new projects can use `supabase/schema.sql`. The profile trigger copies the phone
  from signup metadata, since the Auth user's native phone field will be empty.

These settings follow Supabase's [password authentication documentation](https://supabase.com/docs/guides/auth/passwords).
Never change the internal identifier format/domain after users register without
migrating their Auth login IDs too.

## Existing accounts

Existing email accounts and accounts created through the native Phone provider
must be migrated before this version is deployed. Keep their UUIDs, passwords,
roles, profiles, and related records. Do not create replacement accounts.

Review ownership and prepare a local ignored `supabase/phone-login-mappings.json`:

```json
[{ "userId": "existing-auth-user-uuid", "phone": "09123456789" }]
```

With Node.js 24 and a local `SUPABASE_SERVICE_ROLE_KEY` (never a public key), run:

```powershell
node --env-file=.env scripts/migrate-phone-logins.mjs supabase/phone-login-mappings.json
```

This defaults to a read-only preflight. Add `--apply` to update the reviewed users'
Auth email identifiers using the [Admin API](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid),
with `email_confirm: true`. No confirmation mail is sent. Passwords and UUIDs
are unchanged. Existing real Auth emails are replaced, so retain a private backup
of the original account mapping for rollback. Legacy profile contact data is kept.
The script does not update profile contact numbers or delete native phone identities.

Preflight checks all mappings before writing: duplicate users/numbers, missing
users, conflicting Auth emails/phones, and attempts to replace existing login
numbers. API failures may leave a partially completed batch; rerunning after fixing
the failure is safe. The script migrates only supplied rows. Include all accounts,
especially administrators, and smoke-test them before rollout.

## Recovery and limitations

Numbers act as usernames and ownership is unverified. Password recovery is handled
by an administrator after an independent account ownership check; no email or SMS
reset form is offered. Editing the required phone number in Edit Profile changes both the contact number
and login username. After saving, use the new number and the same password.
The raw Supabase Auth user contains an internal email; app profile queries and
account screens exclude it. This is an application convention built on email/password,
not Supabase's native phone authentication. Direct Supabase API calls remain possible
and retain the project's normal signup, rate-limit, and database authorization rules.

## Validation

Run `node --test tests/*.test.mjs`, `npx.cmd tsc --noEmit`,
`npm.cmd run lint`, and `npx.cmd next build --webpack`.

With the settings above, test new farmer/buyer signup, login using 09/+63 formats,
wrong passwords, duplicate registration, migrated admin access, existing records,
contact editing, and admin exports. Check that signup sends no messages and the
Phone provider stays disabled. No live configuration is changed by the code.

## Enable phone changes in Edit Profile

1. Run `supabase/migration-sync-login-phone.sql` once in Supabase SQL Editor
   (already included for fresh installs in `supabase/schema.sql`). This installs
   an Auth-email update trigger that changes the profile phone/name in the same
   database transaction, plus a guard against profile-only phone changes.
2. Set `SUPABASE_SERVICE_ROLE_KEY` in your server environment and hosting provider,
   then restart/redeploy the app. Keep it out of source control and never prefix
   it with `NEXT_PUBLIC_`. Phone changes use the server-only Admin API so no
   confirmation mail is sent. Email authentication stays ON, Confirm email OFF,
   and Phone stays OFF.
3. Saving with a new number updates the signed-in user's internal login ID and
   profile together. Duplicate login IDs are rejected without a profile write.
   The API never accepts a target user ID or role from the form. Missing migration
   or missing server key blocks number changes without changing existing data.
4. Name-only edits still work without administration credentials. After saving,
   the browser refreshes its session and profile. A number change retains user
   UUID, password, role, listings, and crop records.

Smoke-test changing a number, signing out, and logging in with the new number and
existing password; the old number should fail. Test duplicate and blank numbers,
name-only edits, unauthorized PUT requests, and a failed Auth update. Run the SQL
against staging before rollout; unit tests fake the Supabase boundary and do not
substitute for a live database transaction check.
