import { createClient } from "@/lib/supabase/client";
import { Profile, UserRole } from "@/lib/types/auth";
import type { User } from "@supabase/supabase-js";
import { parseAuthIdentifier, phoneLoginCredentials } from "@/lib/auth-identifier";

export async function signIn(identifier: string, password: string, supabase = createClient()): Promise<{ user: User | null; error: Error | null }> {
  let credentials;
  try {
    credentials = phoneLoginCredentials(identifier);
  } catch (error) {
    return { user: null, error: error as Error };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ ...credentials, password });
  return { user: data?.user || null, error };
}

export async function signUp(identifier: string, password: string, role: UserRole, fullName: string, supabase = createClient()): Promise<{ user: User | null; error: Error | null }> {
  let credentials;
  try {
    credentials = phoneLoginCredentials(identifier);
  } catch (error) {
    return { user: null, error: error as Error };
  }
  const { data, error } = await supabase.auth.signUp({
    ...credentials,
    password,
    options: { data: { full_name: fullName, role, phone: parseAuthIdentifier(identifier).phone } },
  });

  // The profile row is created by the handle_new_user database trigger (from the
  // metadata above). The internal email login must return a session with confirmations disabled.
  if (!error && data?.user && !data.session) {
    return {
      user: data.user,
      error: new Error("Account setup requires administrator assistance. Please contact the administrator before trying again."),
    };
  }
  return { user: data?.user || null, error };
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
  const { data, error } = await supabase.from("profiles").select("id, full_name, phone, role, created_at").eq("id", userId).single();
  return { profile: data as Profile || null, error };
}

export async function updateProfile(updates: { full_name: string; phone: string }): Promise<{ profile: Profile | null; user?: User; error: Error | null }> {
  try {
    const response = await fetch("/api/auth", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: updates.full_name, phone: updates.phone }),
    });
    const result = await response.json();
    if (!response.ok) return { profile: null, error: new Error(result.error || "Could not save your profile.") };
    const supabase = createClient();
    const { data } = await supabase.auth.refreshSession();
    return { profile: result.profile, user: data.user || undefined, error: null };
  } catch {
    return { profile: null, error: new Error("Could not save your profile. Please check your connection and try again.") };
  }
}

export async function getCurrentUser(): Promise<{ user: User | null; profile: Profile | null; error: Error | null }> {
  const { user, error: userError } = await getUser();
  if (userError || !user) {
    return { user: null, profile: null, error: userError };
  }

  const { profile, error: profileError } = await getProfile(user.id);
  return { user, profile, error: profileError };
}
