#!/usr/bin/env node
/**
 * Send a one-off product update email to all Supabase users (excluding admins).
 *
 * Usage:
 *   node scripts/send-product-update-email.mjs --preview          # show plain-text preview
 *   node scripts/send-product-update-email.mjs --list-recipients  # list who would receive
 *   node scripts/send-product-update-email.mjs --send             # actually send via Resend
 *
 * Requires root .env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY
 * Optional: ADMIN_EMAILS=comma,separated,list (also skips app_metadata.role=admin)
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function loadEnv() {
  const envPath = resolve(ROOT, ".env");
  if (!existsSync(envPath)) {
    console.error("Missing .env at repo root");
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const SUBJECT = "I tidied your study desk (the app) — Nika";
const TEMPLATE_PATH = resolve(ROOT, "supabase/templates/product_update_jun2026.html");
const FROM = "Nika <noreply@nika-oet.fun>";
const REPLY_TO = "support@nika-oet.fun";

function firstName(email, metadata = {}) {
  if (metadata.full_name) {
    const part = String(metadata.full_name).trim().split(/\s+/)[0];
    if (part) return part;
  }
  const local = email.split("@")[0] ?? "there";
  const cleaned = local.replace(/[._+-]/g, " ").trim().split(/\s+/)[0];
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "there";
}

function isAdmin(user, adminEmailSet) {
  const role = user.app_metadata?.role ?? user.raw_app_meta_data?.role;
  if (role === "admin") return true;
  const email = (user.email ?? "").toLowerCase();
  return adminEmailSet.has(email);
}

async function listAllUsers(supabaseUrl, serviceKey) {
  const users = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const url = `${supabaseUrl.replace(/\/$/, "")}/auth/v1/admin/users?page=${page}&per_page=${perPage}`;
    const res = await fetch(url, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase list users failed (${res.status}): ${body.slice(0, 300)}`);
    }
    const data = await res.json();
    const batch = data.users ?? [];
    users.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }

  return users;
}

function renderHtml(template, first) {
  return template.replace(/\{\{FirstName\}\}/g, first);
}

function htmlToPlainPreview(html, first) {
  const rendered = renderHtml(html, first);
  return rendered
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h1>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function sendViaResend(apiKey, to, html) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      reply_to: REPLY_TO,
      subject: SUBJECT,
      html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend failed for ${to} (${res.status}): ${body.slice(0, 300)}`);
  }
  return res.json();
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const preview = args.has("--preview");
  const listRecipients = args.has("--list-recipients");
  const send = args.has("--send");

  if (!preview && !listRecipients && !send) {
    console.log("Pass --preview, --list-recipients, or --send");
    process.exit(1);
  }

  const env = loadEnv();
  const supabaseUrl = env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = env.RESEND_API_KEY;
  const adminEmails = (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!supabaseUrl || !serviceKey) {
    console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required in .env");
    process.exit(1);
  }

  const template = readFileSync(TEMPLATE_PATH, "utf8");
  const allUsers = await listAllUsers(supabaseUrl, serviceKey);
  const adminEmailSet = new Set(adminEmails);

  const recipients = allUsers.filter(
    (u) => u.email && !isAdmin(u, adminEmailSet),
  );

  const skippedAdmins = allUsers.filter((u) => u.email && isAdmin(u, adminEmailSet));

  console.log(`Total auth users: ${allUsers.length}`);
  console.log(`Recipients (non-admin): ${recipients.length}`);
  console.log(`Skipped (admin): ${skippedAdmins.length}`);
  if (skippedAdmins.length) {
    console.log("Skipped emails:", skippedAdmins.map((u) => u.email).join(", "));
  }
  console.log(`Subject: ${SUBJECT}`);
  console.log(`From: ${FROM}`);
  console.log("");

  if (preview) {
    const sampleFirst = firstName(recipients[0]?.email ?? "student@example.com");
    const plain = htmlToPlainPreview(template, sampleFirst);
    console.log("--- PLAIN-TEXT PREVIEW (sample FirstName) ---\n");
    console.log(plain);
    console.log("\n--- END PREVIEW ---");
  }

  if (listRecipients) {
    console.log("\n--- RECIPIENTS ---");
    for (const u of recipients) {
      const fn = firstName(u.email, u.user_metadata ?? {});
      console.log(`${u.email} (${fn})`);
    }
  }

  if (send) {
    if (!resendKey) {
      console.error("RESEND_API_KEY required in .env for --send");
      process.exit(1);
    }
    console.log("\nSending...");
    let ok = 0;
    let fail = 0;
    for (const u of recipients) {
      const fn = firstName(u.email, u.user_metadata ?? {});
      const html = renderHtml(template, fn);
      try {
        const result = await sendViaResend(resendKey, u.email, html);
        console.log(`✓ ${u.email} → ${result.id ?? "sent"}`);
        ok += 1;
        await new Promise((r) => setTimeout(r, 600));
      } catch (err) {
        console.error(`✗ ${u.email}: ${err.message}`);
        fail += 1;
      }
    }
    console.log(`\nDone: ${ok} sent, ${fail} failed`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
