// CSV helpers for admin exports. Cells starting with = + - @ are prefixed with
// an apostrophe so spreadsheets don't execute user-entered text as formulas.
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = typeof value === "object" ? JSON.stringify(value) : String(value);
  // Plain numbers and phone numbers (e.g. +639171234567) are not formulas; leave them intact.
  const plainNumber = /^[+-]?[\d\s().-]+$/.test(s);
  if (!plainNumber && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers, ...rows].map((r) => r.map(csvCell).join(","));
  // BOM so Excel reads UTF-8 (names, accents) correctly.
  return "﻿" + lines.join("\r\n") + "\r\n";
}
