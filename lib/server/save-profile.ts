import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { parseAuthIdentifier, phoneLoginCredentials } from "@/lib/auth-identifier";

const profileColumns = "id, full_name, phone, role, created_at";

/** Only call with the user verified by the request's cookie-backed auth.getUser(). */
export async function saveProfile(
  supabase: SupabaseClient,
  createAdmin: () => SupabaseClient,
  user: User,
  input: { fullName?: unknown; phone?: unknown },
) {
  if (typeof input.fullName !== "string" || !input.fullName.trim()) {
    return { error: "Please enter your name.", status: 400 };
  }
  let phone: string;
  try {
    if (typeof input.phone !== "string") throw new Error();
    phone = parseAuthIdentifier(input.phone).phone;
  } catch {
    return { error: "Enter a valid Philippine mobile number.", status: 400 };
  }
  const fullName = input.fullName.trim();
  const { email } = phoneLoginCredentials(phone);

  if (user.email?.toLowerCase() !== email) {
    // Refuse to change Auth unless the atomic database sync is installed.
    const { data: ready, error: migrationError } = await supabase.rpc("phone_login_sync_ready");
    if (migrationError || !ready) {
      return { error: "Phone changes are not available yet. Please contact the administrator.", status: 503 };
    }
    let admin: SupabaseClient;
    try {
      admin = createAdmin();
    } catch {
      return { error: "Phone changes are not configured. Please contact the administrator.", status: 503 };
    }
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      email,
      email_confirm: true,
      user_metadata: { ...user.user_metadata, full_name: fullName, phone },
    });
    if (error) {
      const conflict = ["email_exists", "user_already_exists", "identity_already_exists"].includes(error.code || "");
      return {
        error: conflict ? "This phone number is already in use. Choose another number." : "Could not change your phone number. Please try again.",
        status: conflict ? 409 : 500,
      };
    }
    // The Auth update and trigger's profile update commit together. No second write.
    const { data: profile, error: readError } = await supabase.from("profiles")
      .select(profileColumns).eq("id", user.id).single();
    if (readError) return { error: "Your number was saved. Reload the page to see your updated profile.", status: 500 };
    return { profile, status: 200 };
  }

  const { data: profile, error } = await supabase.from("profiles")
    .update({ full_name: fullName, phone }).eq("id", user.id).select(profileColumns).single();
  if (error) return { error: "Could not save your profile. Please try again.", status: 500 };
  return { profile, status: 200 };
}
