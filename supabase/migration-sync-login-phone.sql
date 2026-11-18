-- Atomic sync for phone usernames backed by internal email IDs. Safe to rerun.
BEGIN;

CREATE OR REPLACE FUNCTION public.sync_login_phone_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE login_digits TEXT;
BEGIN
  login_digits := substring(lower(new.email) from '^phone-(639[0-9]{9})@phone[.]kita-ani[.]invalid$');
  IF login_digits IS NOT NULL THEN
    UPDATE public.profiles
    SET phone = '+' || login_digits,
        email = new.email,
        full_name = COALESCE(NULLIF(btrim(new.raw_user_meta_data->>'full_name'), ''), full_name)
    WHERE id = new.id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Cannot change login without an existing profile';
    END IF;
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS sync_login_phone_profile ON auth.users;
CREATE TRIGGER sync_login_phone_profile AFTER UPDATE OF email ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_login_phone_profile();

-- Block direct profile writes that would diverge from an internal login ID.
CREATE OR REPLACE FUNCTION public.enforce_login_phone_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE login_digits TEXT;
BEGIN
  SELECT substring(lower(u.email) from '^phone-(639[0-9]{9})@phone[.]kita-ani[.]invalid$')
  INTO login_digits FROM auth.users u WHERE u.id = new.id;
  IF login_digits IS NOT NULL AND new.phone IS DISTINCT FROM ('+' || login_digits) THEN
    RAISE EXCEPTION 'Change your login phone through Edit Profile';
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS enforce_login_phone_profile ON public.profiles;
CREATE TRIGGER enforce_login_phone_profile BEFORE INSERT OR UPDATE OF phone ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_login_phone_profile();

CREATE OR REPLACE FUNCTION public.phone_login_sync_ready()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT count(*) = 2 FROM pg_catalog.pg_trigger
  WHERE NOT tgisinternal AND tgenabled = 'O' AND (
    (tgname = 'sync_login_phone_profile' AND tgrelid = 'auth.users'::regclass) OR
    (tgname = 'enforce_login_phone_profile' AND tgrelid = 'public.profiles'::regclass)
  );
$$;
REVOKE ALL ON FUNCTION public.phone_login_sync_ready() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.phone_login_sync_ready() TO authenticated;

COMMIT;
