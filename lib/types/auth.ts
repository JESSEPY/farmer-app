import type { User } from "@supabase/supabase-js";

export type UserRole = "farmer" | "buyer";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}