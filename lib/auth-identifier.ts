export type AuthIdentifier = { phone: string };

// Reserved, non-deliverable domain. Never change this after accounts are created.
const LOGIN_DOMAIN = "phone.kita-ani.invalid";

export function phoneLoginCredentials(input: string): { email: string } {
  const { phone } = parseAuthIdentifier(input);
  return { email: `phone-${phone.slice(1)}@${LOGIN_DOMAIN}` };
}

export function getLoginPhone(user: { email?: string; phone?: string }): string | null {
  const match = user.email?.match(/^phone-(639\d{9})@phone\.kita-ani\.invalid$/i);
  return match ? `+${match[1]}` : user.phone || null;
}

/** Normalize PH mobile numbers without truncating or accepting email credentials. */
export function parseAuthIdentifier(input: string): AuthIdentifier {
  const value = input.trim().replace(/[\s()-]/g, "");
  const match = value.match(/^(?:\+63|63|0)?(9\d{9})$/);
  if (!match) {
    throw new Error("Enter a valid Philippine mobile number (e.g. 09123456789).");
  }
  return { phone: `+63${match[1]}` };
}
