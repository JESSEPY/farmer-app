import { createClient } from "@/lib/supabase/client";
import { Profile, UserRole } from "@/lib/types/auth";
import type { User } from "@supabase/supabase-js";
import { parseAuthIdentifier } from "@/lib/auth-identifier";

export async function signIn(identifier: string, password: string, supabase = createClient()): Promise<{ user: User | null; error: Error | null }> {
  let credentials;
  try {
    credentials = parseAuthIdentifier(identifier);
  } catch (error) {
    return { user: null, error: error as Error };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ ...credentials, password });
  return { user: data?.user || null, error };
}

export async function signUp(identifier: string, password: string, role: UserRole, fullName: string, phone: string, supabase = createClient()): Promise<{ user: User | null; error: Error | null; needsVerification: boolean }> {
  let credentials;
  try {
    credentials = parseAuthIdentifier(identifier);
  } catch (error) {
    return { user: null, error: error as Error, needsVerification: false };
  }
  const { data, error } = await supabase.auth.signUp({
    ...credentials,
    password,
    options: { data: { full_name: fullName, role, phone: "phone" in credentials ? credentials.phone : phone || null } },
  });

  // The profile row is created by the handle_new_user database trigger (from the
  // metadata above). Email confirmation may be required before sign in.
  if (!error && data?.user && !data.session && "phone" in credentials) {
    return {
      user: data.user,
      error: new Error("Phone signup requires SMS confirmation on this server. Contact the administrator to finish setting up your account."),
      needsVerification: false,
    };
  }
  return { user: data?.user || null, error, needsVerification: !error && !!data?.user && !data.session };
}

export async function signOut(supabase = createClient()): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getUser(): Promise<{ user: User | null; error: Error | null }> {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user: user || null, error };
}

export async function getProfile(userId: string): Promise<{ profile: Profile | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return { profile: data as Profile || null, error };
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<{ profile: Profile | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single();
  return { profile: data as Profile || null, error };
}

export async function getCurrentUser(): Promise<{ user: User | null; profile: Profile | null; error: Error | null }> {
  const { user, error: userError } = await getUser();
  if (userError || !user) {
    return { user: null, profile: null, error: userError };
  }

  const { profile, error: profileError } = await getProfile(user.id);
  return { user, profile, error: profileError };
}
