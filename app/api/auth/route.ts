import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signIn, signUp, signOut } from "@/lib/services/auth-service";
import { UserRole } from "@/lib/types/auth";
import { saveProfile } from "@/lib/server/save-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLoginPhone } from "@/lib/auth-identifier";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role, created_at")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      authenticated: true,
      user: { id: user.id, phone: getLoginPhone(user) },
      profile,
    });
  } catch (err) {
    console.error("Auth GET error:", err);
    return NextResponse.json({ error: "Failed to get auth status" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, password, role, fullName, phone } = body;
    const identifier = phone || body.identifier;
    if (["signIn", "signUp"].includes(action) &&
        (typeof identifier !== "string" || typeof password !== "string" || !identifier.trim() || !password)) {
      return NextResponse.json({ error: "Phone number and password required" }, { status: 400 });
    }

    if (action === "signIn") {
      if (!identifier || !password) {
        return NextResponse.json({ error: "Phone number and password required" }, { status: 400 });
      }

      const supabase = await createClient();
      const { user, error } = await signIn(identifier, password, supabase);

      if (error || !user) {
        return NextResponse.json({ error: error?.message || "Sign in failed" }, { status: 401 });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, phone, role, created_at")
        .eq("id", user.id)
        .single();

      return NextResponse.json({
        user: { id: user.id, phone: getLoginPhone(user) },
        profile,
      });
    }

    if (action === "signUp") {
      if (!identifier || !password || !role || typeof fullName !== "string" || !fullName.trim() || (phone != null && typeof phone !== "string")) {
        return NextResponse.json({ error: "Phone number, password, role, and fullName required" }, { status: 400 });
      }

      if (!["farmer", "buyer"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }

      const supabase = await createClient();
      const { user, error } = await signUp(identifier, password, role as UserRole, fullName, supabase);

      if (error || !user) {
        return NextResponse.json({ error: error?.message || "Sign up failed" }, { status: 400 });
      }

      return NextResponse.json({
        user: { id: user.id, phone: getLoginPhone(user) },
        message: "Account created successfully",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Auth POST error:", err);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid profile details" }, { status: 400 });
    }
    const result = await saveProfile(supabase, createAdminClient, user, body);
    return NextResponse.json(result.error ? { error: result.error } : { profile: result.profile }, { status: result.status });
  } catch (err) {
    console.error("Auth PUT error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await signOut(supabase);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Signed out successfully" });
  } catch (err) {
    console.error("Auth DELETE error:", err);
    return NextResponse.json({ error: "Sign out failed" }, { status: 500 });
  }
}