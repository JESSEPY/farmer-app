import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { parseAuthIdentifier, phoneLoginCredentials, getLoginPhone } from "../lib/auth-identifier.ts";

function matchesPhone(input, phone) {
  try {
    return !!input && parseAuthIdentifier(input).phone === phone;
  } catch {
    return false;
  }
}

export function validateMappings(input) {
  if (!Array.isArray(input) || !input.length) throw new Error("Provide a nonempty array of reviewed userId/phone mappings.");
  const ids = new Set();
  const phones = new Set();
  return input.map((row) => {
    if (!row || typeof row.userId !== "string" || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(row.userId) || typeof row.phone !== "string") {
      throw new Error("Each mapping needs an Auth user UUID and a phone string.");
    }
    const { phone } = parseAuthIdentifier(row.phone);
    const userId = row.userId.toLowerCase();
    if (ids.has(userId) || phones.has(phone)) throw new Error("Duplicate user or phone number in mappings.");
    ids.add(userId);
    phones.add(phone);
    return { userId, phone };
  });
}

export async function migratePhoneLogins(client, input, apply = false) {
  const mappings = validateMappings(input);
  const users = [];
  for (let page = 1; ; page++) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 1000) break;
  }
  // Preflight the whole batch before making any change, including already linked users.
  for (const { userId, phone } of mappings) {
    const user = users.find((item) => item.id === userId);
    if (!user) throw new Error(`Unknown Auth user: ${userId}`);
    const existingPhone = getLoginPhone(user);
    if (existingPhone && parseAuthIdentifier(existingPhone).phone !== phone) {
      throw new Error(`User already has a different login number: ${userId}`);
    }
    if (users.some((item) => item.id !== userId && (matchesPhone(getLoginPhone(item), phone) || item.email?.toLowerCase() === phoneLoginCredentials(phone).email))) {
      throw new Error(`Phone belongs to another Auth user; resolve the conflict for ${userId}.`);
    }
  }
  if (apply) {
    for (const { userId, phone } of mappings) {
      const { error } = await client.auth.admin.updateUserById(userId, { ...phoneLoginCredentials(phone), email_confirm: true });
      if (error) throw new Error(`Stopped at ${userId}: ${error.message}. Earlier rows may have completed; rerun after resolving the failure.`);
    }
  }
  return mappings.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [file, flag, ...extra] = process.argv.slice(2);
    if (!file || (flag && flag !== "--apply") || extra.length) {
      throw new Error("Usage: node --env-file=.env scripts/migrate-phone-logins.mjs <reviewed-mappings.json> [--apply]");
    }
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in your local environment.");
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const count = await migratePhoneLogins(client, JSON.parse(readFileSync(file, "utf8")), flag === "--apply");
    console.log(`${flag === "--apply" ? "Linked" : "Dry run passed for"} ${count} account(s).`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
