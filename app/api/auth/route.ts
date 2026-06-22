import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signIn, signUp, signOut } from "@/lib/services/auth-service";
import { UserRole } from "@/lib/types/auth";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      authenticated: true,
      user: { id: user.id, email: user.email },
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
    const { action, email, password, role, fullName } = body;

    if (action === "signIn") {
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password required" }, { status: 400 });
      }

      const { user, error } = await signIn(email, password);

      if (error || !user) {
        return NextResponse.json({ error: error?.message || "Sign in failed" }, { status: 401 });
      }

      const supabase = await createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return NextResponse.json({
        user: { id: user.id, email: user.email },
        profile,
      });
    }

    if (action === "signUp") {
      if (!email || !password || !role || !fullName) {
        return NextResponse.json({ error: "Email, password, role, and fullName required" }, { status: 400 });
      }

      if (!["farmer", "buyer"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }

      const { user, error } = await signUp(email, password, role as UserRole, fullName);

      if (error || !user) {
        return NextResponse.json({ error: error?.message || "Sign up failed" }, { status: 400 });
      }

      return NextResponse.json({
        user: { id: user.id, email: user.email },
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
    const { fullName, phone } = body;

    const updates: Record<string, any> = {};
    if (fullName) updates.full_name = fullName;
    if (phone !== undefined) updates.phone = phone;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("Auth PUT error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await signOut();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Signed out successfully" });
  } catch (err) {
    console.error("Auth DELETE error:", err);
    return NextResponse.json({ error: "Sign out failed" }, { status: 500 });
  }
}