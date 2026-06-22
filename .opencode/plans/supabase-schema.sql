-- supabase-schema.sql
-- Run this in Supabase SQL Editor

-- Create profiles table
create table profiles (
  id uuid not null references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null check (role in ('farmer', 'buyer')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- RLS Policies
create policy "Users can read own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Create trigger to auto-create profile on user signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'farmer'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();