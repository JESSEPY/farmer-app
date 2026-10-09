-- HISTORY ONLY: not safe to re-run (policies are not guarded). Run supabase/schema.sql instead.
-- Make new accounts get the role and phone the user chose at signup.
-- Safe to re-run (create or replace). Run in the Supabase SQL Editor.

alter table profiles add column if not exists phone text;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'farmer'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Let signed-in users read other users' profiles. Listings join to the seller's profile
-- (name + phone), and without this policy buyers see "Farmer / No Contact Number".
-- The app never displays other users' emails, but note this policy allows reading them.
drop policy if exists "profiles_select_all" on profiles;
create policy "profiles_select_all" on profiles
  for select using (auth.role() = 'authenticated');

-- The trigger itself (create only if it is missing).
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end $$;
