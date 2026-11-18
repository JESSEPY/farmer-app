import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { parseAuthIdentifier, phoneLoginCredentials } from "../lib/auth-identifier.ts";

const { outputText } = ts.transpileModule(readFileSync(new URL("../lib/server/save-profile.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const exports = {};
vm.runInNewContext(outputText, { exports, require(name) {
  if (name === "server-only") return {};
  if (name === "@/lib/auth-identifier") return { parseAuthIdentifier, phoneLoginCredentials };
  throw new Error(`Unexpected module: ${name}`);
} });
const { saveProfile } = exports;

const user = { id: "own-user", email: phoneLoginCredentials("09123456789").email, user_metadata: { role: "farmer" } };
const changed = { fullName: " New Name ", phone: "09987654321", id: "someone-else", role: "admin" };

function setup({ ready = true, adminError = null, readError = null } = {}) {
  const adminUpdates = [];
  const profileUpdates = [];
  const filters = [];
  const query = {
    select() { return this; },
    eq(column, value) { filters.push([column, value]); return this; },
    update(data) { profileUpdates.push(data); return this; },
    async single() { return { data: { id: user.id, full_name: "New Name", phone: "+639987654321" }, error: readError }; },
  };
  const client = { rpc: async () => ({ data: ready, error: null }), from: () => query };
  const createAdmin = () => ({ auth: { admin: { updateUserById: async (id, attributes) => {
    adminUpdates.push(JSON.parse(JSON.stringify({ id, attributes })));
    return { error: adminError };
  } } } });
  return { client, createAdmin, adminUpdates, profileUpdates, filters };
}

test("changing number updates only the authenticated user's login; profile sync is left to the atomic trigger", async () => {
  const s = setup();
  const result = await saveProfile(s.client, s.createAdmin, user, changed);
  assert.equal(result.status, 200);
  assert.deepEqual(s.adminUpdates, [{ id: user.id, attributes: {
    email: phoneLoginCredentials(changed.phone).email, email_confirm: true,
    user_metadata: { role: "farmer", full_name: "New Name", phone: "+639987654321" },
  } }]);
  assert.equal(s.profileUpdates.length, 0);
  assert.deepEqual(s.filters, [["id", user.id]]);
});

test("name-only changes do not require admin credentials or change login", async () => {
  const s = setup();
  const result = await saveProfile(s.client, () => { throw new Error("should not be called"); }, user,
    { fullName: "Updated", phone: "09123456789" });
  assert.equal(result.status, 200);
  assert.equal(s.adminUpdates.length, 0);
  assert.equal(s.profileUpdates[0].full_name, "Updated");
});

test("missing migration or key prevents any change", async () => {
  const s = setup({ ready: false });
  assert.equal((await saveProfile(s.client, s.createAdmin, user, changed)).status, 503);
  assert.equal(s.adminUpdates.length, 0);
  assert.equal(s.profileUpdates.length, 0);
  const configured = setup();
  assert.equal((await saveProfile(configured.client, () => { throw new Error("missing key"); }, user, changed)).status, 503);
  assert.equal(configured.profileUpdates.length, 0);
});

test("blank, missing and invalid numbers and names cannot change login or profile", async () => {
  for (const input of [{ fullName: " ", phone: changed.phone }, { fullName: "A", phone: null },
    { fullName: "A", phone: "" }, { fullName: "A", phone: "091234567890" }]) {
    const s = setup();
    assert.equal((await saveProfile(s.client, s.createAdmin, user, input)).status, 400);
    assert.equal(s.adminUpdates.length, 0);
    assert.equal(s.profileUpdates.length, 0);
  }
});

test("duplicate number rejects the operation without changing profile or exposing internal emails", async () => {
  const s = setup({ adminError: { code: "email_exists", message: "internal email details" } });
  const result = await saveProfile(s.client, s.createAdmin, user, changed);
  assert.equal(result.status, 409);
  assert.match(result.error, /already in use/);
  assert.equal(s.profileUpdates.length, 0);
});

test("a failed atomic Auth update cannot cause a follow-up profile write", async () => {
  const s = setup({ adminError: { code: "unexpected_failure" } });
  assert.equal((await saveProfile(s.client, s.createAdmin, user, changed)).status, 500);
  assert.equal(s.profileUpdates.length, 0);
});
