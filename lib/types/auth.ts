import type { User } from "@supabase/supabase-js";

export type UserRole = "farmer" | "buyer";
// Self-signup only allows UserRole; "admin" is assigned manually in the database.
export type AppRole = UserRole | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: AppRole;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}