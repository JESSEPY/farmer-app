import assert from "node:assert/strict";
import { test } from "node:test";
import { migratePhoneLogins, validateMappings } from "../scripts/migrate-phone-logins.mjs";

const first = "11111111-1111-4111-8111-111111111111";
const second = "22222222-2222-4222-8222-222222222222";
const mappings = [{ userId: first, phone: "09123456789" }];

function mockClient(users, failure = null) {
  const updates = [];
  return {
    updates,
    auth: { admin: {
      listUsers: async () => ({ data: { users }, error: null }),
      updateUserById: async (id, attributes) => {
        updates.push({ id, attributes });
        return { error: failure };
      },
    } },
  };
}

test("migration rejects duplicate normalized phones, duplicate users, and invalid input", () => {
  for (const input of [[], {}, [{ userId: "invalid", phone: "09123456789" }],
    [...mappings, { userId: second, phone: "+639123456789" }],
    [...mappings, { userId: first, phone: "09987654321" }],
    [{ userId: first, phone: "farmer@example.com" }]]) {
    assert.throws(() => validateMappings(input));
  }
});

test("migration defaults to read-only preflight", async () => {
  const client = mockClient([{ id: first, phone: "" }, { id: second, phone: "+12025550123" }]);
  assert.equal(await migratePhoneLogins(client, mappings), 1);
  assert.deepEqual(client.updates, []);
});

test("migration retains user IDs and passwords and can be rerun", async () => {
  const client = mockClient([{ id: first, email: "phone-639123456789@phone.kita-ani.invalid" }]);
  await migratePhoneLogins(client, mappings, true);
  assert.deepEqual(client.updates, [{
    id: first, attributes: { email: "phone-639123456789@phone.kita-ani.invalid", email_confirm: true },
  }]);
});

test("migration checks the whole batch before updating any account", async () => {
  const client = mockClient([{ id: first, phone: "" }]);
  await assert.rejects(migratePhoneLogins(client,
    [...mappings, { userId: second, phone: "09987654321" }], true), /Unknown Auth user/);
  assert.deepEqual(client.updates, []);
});

test("migration refuses conflicting phone ownership or replacing a login number", async () => {
  for (const users of [
    [{ id: first, phone: "" }, { id: second, phone: "639123456789" }],
    [{ id: first, phone: "" }, { id: second, email: "phone-639123456789@phone.kita-ani.invalid" }],
    [{ id: first, phone: "+639987654321" }],
    [{ id: first, email: "phone-639987654321@phone.kita-ani.invalid" }],
  ]) {
    const client = mockClient(users);
    await assert.rejects(migratePhoneLogins(client, mappings, true));
    assert.deepEqual(client.updates, []);
  }
});

test("migration stops on provider failure with partial-batch guidance", async () => {
  const client = mockClient([{ id: first, phone: "" }], { message: "Provider error" });
  await assert.rejects(migratePhoneLogins(client, mappings, true), /Earlier rows may have completed/);
});
