-- Run before deploying email-or-phone signup. Existing accounts are unchanged.
BEGIN;

ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, phone)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    CASE WHEN new.raw_user_meta_data->>'role' = 'buyer' THEN 'buyer' ELSE 'farmer' END,
    COALESCE(NULLIF(new.phone, ''), new.raw_user_meta_data->>'phone')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMIT;
