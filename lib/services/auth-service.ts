import { createClient } from "@/lib/supabase/client";
import { Profile, UserRole } from "@/lib/types/auth";
import type { User } from "@supabase/supabase-js";

export async function signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data?.user || null, error };
}

export async function signUp(email: string, password: string, role: UserRole, fullName: string): Promise<{ user: User | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error || !data.user) {
    return { user: null, error: error || new Error("Signup failed") };
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    email,
    full_name: fullName,
    role,
  });

  if (profileError) {
    return { user: data.user, error: profileError };
  }

  return { user: data.user, error: null };
}

export async function signOut(): Promise<{ error: Error | null }> {
  const supabase = createClient();
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