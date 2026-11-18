import assert from "node:assert/strict";
import { test } from "node:test";
import { parseAuthIdentifier, phoneLoginCredentials, getLoginPhone } from "../lib/auth-identifier.ts";

test("all number formats map to the same hidden login ID", () => {
  for (const input of ["09123456789", "+63 912 345 6789", "639123456789"]) {
    assert.deepEqual(phoneLoginCredentials(input), { email: "phone-639123456789@phone.kita-ani.invalid" });
  }
  assert.throws(() => phoneLoginCredentials("phone-639123456789@phone.kita-ani.invalid"));
});

test("login phone comes from the Auth login identity, not editable contact metadata", () => {
  assert.equal(getLoginPhone({ email: "phone-639123456789@phone.kita-ani.invalid", phone: "+639987654321" }), "+639123456789");
  assert.equal(getLoginPhone({ phone: "+639123456789" }), "+639123456789");
  assert.equal(getLoginPhone({ email: "legacy@example.com" }), null);
});

test("rejects email identifiers", () => {
  assert.throws(() => parseAuthIdentifier("farmer@example.com"));
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
