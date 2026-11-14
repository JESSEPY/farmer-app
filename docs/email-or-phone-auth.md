# Email or phone authentication

## Deploy

1. Run `supabase/migration-email-or-phone-auth.sql` in the Supabase SQL Editor before deploying the app. New projects can use `supabase/schema.sql` instead. The migration allows profiles without an email and stores the Auth phone number as the initial contact number. Existing accounts and records are retained.
2. In Supabase Authentication providers, leave Email enabled and enable Phone. Disable **Confirm phone** for signup without SMS. Do not enable SMS OTP login in the app. Email verification settings can remain unchanged.
3. Test email signup/confirmation and phone/password signup in a staging project with the same settings before deploying. Phone signup should return a session immediately and send no SMS.

This app calls native Supabase password authentication with either `email` or `phone`. It does not fabricate email addresses, look up emails from public profiles, or send OTPs. See https://supabase.com/docs/guides/auth/passwords.

## Account behavior

- Signup offers email/password or phone/password. Email signup may include an optional contact number, which does not enable phone authentication.
- Login accepts the registered email or Philippine mobile number: `09123456789`, `9123456789`, `639123456789`, or `+639123456789`. Spaces, parentheses, and hyphens are accepted.
- Existing accounts continue using email/password. Profile contact numbers are not automatically migrated into Auth identities: they may be unverified or shared. Linking additional login methods is outside this change.
- Phone numbers are unverified. Someone can register a number they do not own. Changing the contact number on a profile does not change its login number.
- Password recovery remains email-based. Phone-only users must contact an administrator. The administrator must independently establish account ownership before resetting a password using trusted Supabase administration tools; a claimed phone number alone is insufficient. There is no public phone reset endpoint.
- If phone confirmation is accidentally enabled, the app reports the configuration issue rather than showing an email verification message. An account may already have been created; an administrator must resolve it before the user retries.

## Smoke checks

Run automated credential normalization and service tests with Node.js 24:
`node --test tests/auth-identifier.test.mjs tests/auth-service.test.mjs`.
Then check the following against your configured Supabase project:

- Existing email user can sign in and see their original records.
- New email user can register without a phone, complete configured email verification, and use email password recovery.
- New phone user can register without an email and immediately reach the correct farmer/buyer dashboard. Their profile has the phone contact and no email.
- Phone user can sign out and sign back in using all supported number formats and the same password.
- Wrong passwords, duplicate registered numbers, invalid numbers, and signup service failures show errors without navigating to a dashboard.
- A phone-only user sees the recovery guidance on signup and the forgot-password page.
