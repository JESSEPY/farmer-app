# Buyer/Farmer Role Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full buyer/farmer role separation with Supabase Auth - distinct workflows, dashboards, and route protection for each role.

**Architecture:** Supabase Auth for authentication with role selection during signup. Role stored in `profiles` table with RLS. Separate `/farmer/` and `/buyer/` route groups with role-based middleware protection. Auth context provider exposes current user role throughout app.

**Tech Stack:** Next.js 16 (App Router), Supabase Auth (@supabase/ssr, @supabase/supabase-js), React Context for auth state.

---

## File Structure

```
lib/
  supabase/
    client.ts       # Browser client instance
    server.ts       # Server components client
    types.ts       # TypeScript types for profiles

components/
  auth/
    auth-provider.tsx      # React context for auth state
    protected-route.tsx    # Role-based route protection

app/
  (auth)/              # New auth route group (unauthenticated)
    login/
      page.tsx       # Sign in page
    signup/
      page.tsx       # Sign up with role selection
    layout.tsx      # Minimal layout (no nav)
  (farmer)/           # Farmer-only routes
    dashboard/
      page.tsx       # Farmer dashboard (moved from /home)
    crops/
      page.tsx       # (existing)
      new/page.tsx   # (existing)
      [id]/page.tsx  # (existing)
    market/
      new/page.tsx   # Post listing (farmer only)
    layout.tsx       # Farmer nav variant
  (buyer)/           # Buyer-only routes
    dashboard/
      page.tsx       # Buyer dashboard
    market/
      page.tsx       # Browse listings (no post)
      [id]/page.tsx  # View detail, buy action
    layout.tsx       # Buyer nav variant
```

---

## Task 1: Install Supabase Dependencies

**Goal:** Add Supabase auth packages to project

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Supabase packages**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Verify installation**

```bash
npm list @supabase/supabase-js @supabase/ssr
```
Expected: Both packages listed with version numbers

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add Supabase auth packages"
```

---

## Task 2: Create Supabase Client

**Goal:** Create Supabase client files for browser and server usage

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/types.ts`

- [ ] **Step 1: Create types file**

```typescript
// lib/supabase/types.ts
export type UserRole = "farmer" | "buyer";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}
```

- [ ] **Step 2: Create browser client**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: Create server client**

```typescript
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from Server Component
          }
        },
      },
    }
  );
}
```

- [ ] **Step 4: Create .env.local with placeholder values**

```bash
# .env.local (add to file)
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key
```

- [ ] **Step 5: Commit**

```bash
git add lib/supabase/
git commit -m "feat: add Supabase client files"
```

---

## Task 3: Create Auth Provider Context

**Goal:** Create React context to manage auth state and provide user role throughout app

**Files:**
- Create: `components/auth/auth-provider.tsx`

- [ ] **Step 1: Create Auth Provider component**

```tsx
// components/auth/auth-provider.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { User, Profile, UserRole } from "@/lib/supabase/types";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthContextType {
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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user as User);
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (profile) setProfile(profile as Profile);
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, role: UserRole, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error };

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        email,
        full_name: fullName,
        role,
      });
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
```

- [ ] **Step 2: Commit**

```bash
git add components/auth/
git commit -m "feat: add auth provider context"
```

---

## Task 4: Create Database Schema (SQL)

**Goal:** Provide SQL for Supabase database setup

**Files:**
- Create: `.opencode/plans/supabase-schema.sql`

- [ ] **Step 1: Write SQL schema**

```sql
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
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'farmer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

- [ ] **Step 2: Commit**

```bash
git add .opencode/plans/supabase-schema.sql
git commit -m "docs: add Supabase schema SQL"
```

---

## Task 5: Create Login Page

**Goal:** Create authentication login page

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/layout.tsx`

- [ ] **Step 1: Create auth layout**

```tsx
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create login page**

```tsx
// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/
git commit -m "feat: add login page"
```

---

## Task 6: Create Signup Page with Role Selection

**Goal:** Create signup page with role selection (farmer/buyer)

**Files:**
- Create: `app/(auth)/signup/page.tsx`

- [ ] **Step 1: Create signup page**

```tsx
// app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, ShoppingBag } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("farmer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await signUp(email, password, role, fullName);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Join the Masbate Farmer Marketplace</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("farmer")}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                role === "farmer"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Sprout className="w-6 h-6 mb-2" />
              <p className="font-medium">Farmer</p>
              <p className="text-xs text-muted-foreground">Sell crops</p>
            </button>
            <button
              type="button"
              onClick={() => setRole("buyer")}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                role === "buyer"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <ShoppingBag className="w-6 h-6 mb-2" />
              <p className="font-medium">Buyer</p>
              <p className="text-xs text-muted-foreground">Buy crops</p>
            </button>
          </div>

          <div>
            <Input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(auth\)/
git commit -m "feat: add signup page with role selection"
```

---

## Task 7: Create Protected Route Component

**Goal:** Create wrapper component to protect routes by role

**Files:**
- Create: `components/auth/protected-route.tsx`

- [ ] **Step 1: Create protected route**

```tsx
// components/auth/protected-route.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/components/auth/auth-provider";
import { ReactNode, useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      router.push(redirectTo);
    } else if (!loading && user && profile && !allowedRoles.includes(profile.role)) {
      router.push(profile.role === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard");
    }
  }, [user, profile, loading, allowedRoles, redirectTo, router]);

  if (loading || !user || !profile || !allowedRoles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/auth/protected-route.tsx
git commit -m "feat: add protected route component"
```

---

## Task 8: Create Farmer Dashboard Page

**Goal:** Create dedicated farmer dashboard with crop management focus (refactored from existing /home)

**Files:**
- Create: `app/(farmer)/dashboard/page.tsx`
- Create: `app/(farmer)/layout.tsx`
- Modify: `components/layout/nav.tsx` (update links)

- [ ] **Step 1: Create farmer layout**

```tsx
// app/(farmer)/layout.tsx
import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/layout/nav";

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation role="farmer" />
      <Header />
      {children}
    </>
  );
}
```

- [ ] **Step 2: Create farmer dashboard**

```tsx
// app/(farmer)/dashboard/page.tsx
"use client";

import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { CropSummary } from "@/components/dashboard/crop-summary";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PageContainer } from "@/components/layout/page-container";

export default function FarmerDashboard() {
  return (
    <PageContainer>
      <div className="space-y-5 sm:space-y-6">
        <section>
          <WeatherWidget />
        </section>

        <section>
          <h2 className="text-[17px] font-semibold mb-3">Quick Actions</h2>
          <QuickActions />
        </section>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          <section>
            <CropSummary />
          </section>

          <section>
            <RecentActivity />
          </section>
        </div>

        <section className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl bg-primary/10 text-center">
            <p className="text-xl sm:text-2xl font-bold text-primary">12</p>
            <p className="text-xs text-muted-foreground">Active Listings</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-accent/10 text-center">
            <p className="text-xl sm:text-2xl font-bold text-accent-foreground">5</p>
            <p className="text-xs text-muted-foreground">Pending Orders</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-secondary/10 text-center">
            <p className="text-xl sm:text-2xl font-bold text-secondary-foreground">4.8</p>
            <p className="text-xs text-muted-foreground">Buyer Rating</p>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
```

- [ ] **Step 3: Update Navigation to accept role prop**

```tsx
// components/layout/nav.tsx - modify to accept role
const navItemsFarmer = [
  { href: "/farmer/dashboard", label: "Home", icon: Home },
  { href: "/farmer/crops", label: "Crops", icon: Sprout },
  { href: "/farmer/market", label: "Market", icon: Store },
  { href: "/chat", label: "AI", icon: Sparkles },
  { href: "/profile", label: "Profile", icon: User },
];

const navItemsBuyer = [
  { href: "/buyer/dashboard", label: "Home", icon: Home },
  { href: "/buyer/market", label: "Market", icon: Store },
  { href: "/chat", label: "AI", icon: Sparkles },
  { href: "/profile", label: "Profile", icon: User },
];

export function Navigation({ role = "farmer" }: { role?: "farmer" | "buyer" }) {
  const navItems = role === "farmer" ? navItemsFarmer : navItemsBuyer;
  // ... rest unchanged
}
```

- [ ] **Step 4: Commit**

```bash
git add app/\(farmer\)/ components/layout/nav.tsx
git commit -m "feat: add farmer dashboard and layout"
```

---

## Task 9: Create Buyer Dashboard Page

**Goal:** Create buyer dashboard with marketplace browsing focus

**Files:**
- Create: `app/(buyer)/dashboard/page.tsx`
- Create: `app/(buyer)/layout.tsx`

- [ ] **Step 1: Create buyer layout**

```tsx
// app/(buyer)/layout.tsx
import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/layout/nav";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation role="buyer" />
      <Header />
      {children}
    </>
  );
}
```

- [ ] **Step 2: Create buyer dashboard**

```tsx
// app/(buyer)/dashboard/page.tsx
"use client";

import Link from "next/link";
import { Store, TrendingUp, Star } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";

export default function BuyerDashboard() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold">Welcome to the Marketplace</h1>
          <p className="text-muted-foreground">Browse fresh crops from local farmers</p>
        </section>

        <section className="grid grid-cols-3 gap-4">
          <Link
            href="/buyer/market"
            className="p-4 rounded-xl bg-primary/10 text-center hover:bg-primary/20 transition-colors"
          >
            <Store className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="font-bold">Browse</p>
            <p className="text-xs text-muted-foreground">All Listings</p>
          </Link>
          <div className="p-4 rounded-xl bg-accent/10 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-accent-foreground" />
            <p className="font-bold">3</p>
            <p className="text-xs text-muted-foreground">Active Orders</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/10 text-center">
            <Star className="w-6 h-6 mx-auto mb-2 text-secondary-foreground" />
            <p className="font-bold">4.9</p>
            <p className="text-xs text-muted-foreground">Your Rating</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Featured Listings</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <p className="text-muted-foreground col-span-full">
              <Link href="/buyer/market" className="text-primary hover:underline">
                Browse the market
              </Link>{" "}
              to see available crops
            </p>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(buyer\)/
git commit -m "feat: add buyer dashboard"
```

---

## Task 10: Update Landing Page Buttons

**Goal:** Update CTA section to link to signup instead of /home

**Files:**
- Modify: `components/landing/cta-section.tsx`

- [ ] **Step 1: Update buttons**

```tsx
// components/landing/cta-section.tsx
// Change these lines:
<Link href="/signup" className="flex items-center">
// ... from /home
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/cta-section.tsx
git commit -m "feat: update landing CTA to signup"
```

---

## Task 11: Wrap App with Auth Provider

**Goal:** Add AuthProvider to root layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Wrap app with AuthProvider**

```tsx
// app/layout.tsx - add import and wrap children
import { AuthProvider } from "@/components/auth/auth-provider";

// In the return statement:
<AuthProvider>{children}</AuthProvider>
```

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wrap app with auth provider"
```

---

## Verification Commands

After completing all tasks, verify with:

```bash
# Build check
npm run build

# Lint check  
npm run lint
```

---

## Plan complete and saved to `.opencode/plans/2026-05-03-buyer-farmer-role-separation.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**