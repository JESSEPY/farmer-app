import assert from "node:assert/strict";
import { test } from "node:test";
import { parseAuthIdentifier } from "../lib/auth-identifier.ts";

test("preserves existing email identifiers and trims surrounding whitespace", () => {
  assert.deepEqual(parseAuthIdentifier("  farmer@example.com  "), { email: "farmer@example.com" });
});

test("normalizes supported Philippine mobile formats to one Auth identity", () => {
  for (const value of ["09123456789", "9123456789", "639123456789", "+639123456789", "+63 (912) 345-6789"]) {
    assert.deepEqual(parseAuthIdentifier(value), { phone: "+639123456789" });
  }
});

test("rejects malformed identifiers instead of truncating or stripping arbitrary text", () => {
  for (const value of ["", "user@", "a@@example.com", "a b@example.com", "091234567890", "08123456789", "+19123456789", "call09123456789", "09123", "++639123456789"]) {
    assert.throws(() => parseAuthIdentifier(value));
  }
});
