// Philippine mobile numbers: stored as E.164 (+639XXXXXXXXX), typed as the 10 digits after +63.

/** Keep digits only; drop a pasted leading "+63", "63" or "0"; cap at 10 digits. */
export function sanitizeLocalPhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("63")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 10);
}

/** A valid PH mobile number is 10 digits starting with 9 (e.g. 9123456789). */
export function isValidLocalPhone(local: string): boolean {
  return /^9\d{9}$/.test(local);
}

export function toE164(local: string): string {
  return `+63${local}`;
}

/** "+639123456789" -> "+63 912 345 6789"; returns the input unchanged if it doesn't match. */
export function formatPhone(phone: string): string {
  const match = phone.replace(/[^\d+]/g, "").match(/^\+63(\d{3})(\d{3})(\d{4})$/);
  return match ? `+63 ${match[1]} ${match[2]} ${match[3]}` : phone;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function smsHref(phone: string): string {
  return `sms:${phone.replace(/[^\d+]/g, "")}`;
}
