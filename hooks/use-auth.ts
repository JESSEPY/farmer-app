"use client";

import { useAuth as useAuthContext, type AuthContextType } from "@/components/auth/auth-provider";

export function useAuth(): AuthContextType {
  return useAuthContext();
}

export type { AuthContextType };