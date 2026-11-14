export type AuthIdentifier = { email: string } | { phone: string };

/** Accept email or PH mobile numbers without silently truncating invalid input. */
export function parseAuthIdentifier(input: string): AuthIdentifier {
  const value = input.trim();
  if (value.includes("@")) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error("Enter a valid email address.");
    }
    return { email: value };
  }

  const digits = value.replace(/[\s()-]/g, "");
  const match = digits.match(/^(?:\+63|63|0)?(9\d{9})$/);
  if (!match) {
    throw new Error("Enter a valid email or Philippine mobile number (e.g. 09123456789).");
  }
  return { phone: `+63${match[1]}` };
}
