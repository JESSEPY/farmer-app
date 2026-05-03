"use client";

import { createClient } from "@/lib/supabase/client";
import { Profile, UserRole } from "@/lib/supabase/types";
import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { signIn as signInUser, signUp as signUpUser, signOut as signOutUser, getCurrentUser } from "@/lib/services/auth-service";

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, role: UserRole, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const initAuth = async () => {
      const { user, profile, error } = await getCurrentUser();
      if (user && !error) {
        setUser(user);
        setProfile(profile);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user as User || null);
      if (!session?.user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
  const { user, error } = await signInUser(email, password);
  if (!error && user) {
    const { profile } = await getCurrentUser();
    setUser(user);
    setProfile(profile);
  }
  return { error };
};

  const signUp = async (email: string, password: string, role: UserRole, fullName: string) => {
  const { user, error } = await signUpUser(email, password, role, fullName);
  if (!error && user) {
    const { profile } = await getCurrentUser();
    setUser(user);
    setProfile(profile);
  }
  return { error: error || null };
};

  const signOut = async () => {
  await signOutUser();
  setUser(null);
  setProfile(null);
};

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export { type UserRole };
export type { Profile };