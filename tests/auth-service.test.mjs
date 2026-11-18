import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { parseAuthIdentifier, phoneLoginCredentials } from "../lib/auth-identifier.ts";

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
      if (name === "@/lib/auth-identifier") return { parseAuthIdentifier, phoneLoginCredentials };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return exports;
}

test("login submits internal login credentials with the existing password", async () => {
  const calls = [];
  const user = { id: "existing-user" };
  const service = loadService({ signInWithPassword: async (request) => {
    calls.push(JSON.parse(JSON.stringify(request)));
    return { data: { user }, error: null };
  } });
  assert.equal((await service.signIn(" +63 912 345 6789 ", "secret")).user, user);
  await service.signIn("09123456789", "secret");
  assert.deepEqual(calls, [
    { email: "phone-639123456789@phone.kita-ani.invalid", password: "secret" },
    { email: "phone-639123456789@phone.kita-ani.invalid", password: "secret" },
  ]);
  assert.ok((await service.signIn("091234567890", "secret")).error);
  assert.ok((await service.signIn("farmer@example.com", "secret")).error);
  assert.equal(calls.length, 2);
});

test("phone signup needs no email and preserves role and contact metadata", async () => {
  let request;
  const service = loadService({ signUp: async (value) => {
    request = JSON.parse(JSON.stringify(value));
    return { data: { user: { id: "phone-user" }, session: {} }, error: null };
  } });
  const result = await service.signUp("09123456789", "secret", "buyer", "Buyer");
  assert.deepEqual(request, {
    email: "phone-639123456789@phone.kita-ani.invalid", password: "secret",
    options: { data: { full_name: "Buyer", role: "buyer", phone: "+639123456789" } },
  });
  assert.equal(result.error, null);
});

test("email signup is rejected without contacting Supabase", async () => {
  let calls = 0;
  const service = loadService({ signUp: async () => { calls++; } });
  const result = await service.signUp("farmer@example.com", "secret", "farmer", "Farmer");
  assert.ok(result.error);
  assert.equal(result.user, null);
  assert.equal(calls, 0);
});

test("confirmation misconfiguration reports administrator guidance", async () => {
  const service = loadService({ signUp: async () => ({
    data: { user: { id: "unconfirmed" }, session: null }, error: null,
  }) });
  const result = await service.signUp("09123456789", "secret", "farmer", "Farmer");
  assert.match(result.error.message, /administrator assistance/);
});

test("provider errors propagate without reporting successful signup", async () => {
  const error = new Error("Phone already registered");
  const service = loadService({ signUp: async () => ({ data: { user: null }, error }) });
  const result = await service.signUp("09123456789", "secret", "farmer", "Farmer");
  assert.equal(result.error, error);
  assert.equal(result.user, null);
});
