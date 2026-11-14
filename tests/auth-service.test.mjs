import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { parseAuthIdentifier } from "../lib/auth-identifier.ts";

// Exercise the real service with a fake Supabase boundary; no network or credentials.
function loadService(auth) {
  const source = readFileSync(new URL("../lib/services/auth-service.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require(name) {
      if (name === "@/lib/supabase/client") return { createClient: () => ({ auth }) };
      if (name === "@/lib/auth-identifier") return { parseAuthIdentifier };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return exports;
}

test("login submits native email or phone credentials with the existing password", async () => {
  const calls = [];
  const user = { id: "existing-user" };
  const service = loadService({ signInWithPassword: async (request) => {
    calls.push(JSON.parse(JSON.stringify(request)));
    return { data: { user }, error: null };
  } });
  assert.equal((await service.signIn(" farmer@example.com ", "secret")).user, user);
  await service.signIn("09123456789", "secret");
  assert.deepEqual(calls, [
    { email: "farmer@example.com", password: "secret" },
    { phone: "+639123456789", password: "secret" },
  ]);
  assert.ok((await service.signIn("091234567890", "secret")).error);
  assert.equal(calls.length, 2);
});

test("phone signup needs no email and preserves role and contact metadata", async () => {
  let request;
  const service = loadService({ signUp: async (value) => {
    request = JSON.parse(JSON.stringify(value));
    return { data: { user: { id: "phone-user" }, session: {} }, error: null };
  } });
  const result = await service.signUp("09123456789", "secret", "buyer", "Buyer", "");
  assert.deepEqual(request, {
    phone: "+639123456789", password: "secret",
    options: { data: { full_name: "Buyer", role: "buyer", phone: "+639123456789" } },
  });
  assert.equal(result.error, null);
  assert.equal(result.needsVerification, false);
});

test("email signup retains email confirmation without requiring a phone", async () => {
  let request;
  const service = loadService({ signUp: async (value) => {
    request = JSON.parse(JSON.stringify(value));
    return { data: { user: { id: "email-user" }, session: null }, error: null };
  } });
  const result = await service.signUp("farmer@example.com", "secret", "farmer", "Farmer", "");
  assert.equal(request.email, "farmer@example.com");
  assert.equal(request.options.data.phone, null);
  assert.equal(result.error, null);
  assert.equal(result.needsVerification, true);
});

test("phone confirmation misconfiguration does not trigger an email dialog", async () => {
  const service = loadService({ signUp: async () => ({
    data: { user: { id: "unconfirmed" }, session: null }, error: null,
  }) });
  const result = await service.signUp("09123456789", "secret", "farmer", "Farmer", "");
  assert.match(result.error.message, /SMS confirmation/);
  assert.equal(result.needsVerification, false);
});

test("provider errors propagate without reporting successful signup", async () => {
  const error = new Error("Phone already registered");
  const service = loadService({ signUp: async () => ({ data: { user: null }, error }) });
  const result = await service.signUp("09123456789", "secret", "farmer", "Farmer", "");
  assert.equal(result.error, error);
  assert.equal(result.user, null);
  assert.equal(result.needsVerification, false);
});
