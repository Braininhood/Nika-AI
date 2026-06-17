#!/usr/bin/env node
/**
 * Push OET Coach magic-link email template to hosted Supabase.
 *
 * Requires: custom SMTP enabled OR Supabase Pro (free tier + default email cannot edit templates).
 *
 * PowerShell:
 *   $env:SUPABASE_ACCESS_TOKEN = "sbp_xxx"
 *   node scripts/apply-supabase-magic-link-template.mjs
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF?.trim();
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!PROJECT_REF) {
  console.error(`
Missing SUPABASE_PROJECT_REF.

PowerShell:
  $env:SUPABASE_PROJECT_REF = "your-project-ref"
  $env:SUPABASE_ACCESS_TOKEN = "sbp_xxx"
  node scripts/apply-supabase-magic-link-template.mjs

Project ref: Supabase Dashboard → Project Settings → General → Reference ID
`);
  process.exit(1);
}

if (!TOKEN) {
  console.error(`
Missing SUPABASE_ACCESS_TOKEN.

PowerShell:
  $env:SUPABASE_ACCESS_TOKEN = "sbp_xxx"
  node scripts/apply-supabase-magic-link-template.mjs

Create token: https://supabase.com/dashboard/account/tokens

Note: Free-tier projects must enable Custom SMTP before templates can be changed.
See supabase/templates/README.md
`);
  process.exit(1);
}

const templatePath = join(ROOT, "supabase", "templates", "magic_link.html");
const content = readFileSync(templatePath, "utf8");

const payload = {
  mailer_subjects_magic_link: "Sign in to OET Coach",
  mailer_templates_magic_link_content: content,
};

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const text = await res.text();
if (!res.ok) {
  console.error("Failed to update template:", res.status, text);
  if (text.includes("free tier") || text.includes("custom SMTP")) {
    console.error(`
────────────────────────────────────────────────────────────
Supabase free tier blocks custom auth emails on the DEFAULT
mail server. You must do ONE of the following:

  A) Enable Custom SMTP (recommended — Resend free tier works)
     Dashboard → Authentication → SMTP Settings
     Then run this script again.

  B) Upgrade Supabase to Pro

  C) Use Google sign-in only for now (no branded magic-link email)

Full steps: supabase/templates/README.md
────────────────────────────────────────────────────────────`);
  }
  process.exit(1);
}

console.log("✓ Magic link email updated for project", PROJECT_REF);
console.log("  Subject: Sign in to OET Coach");
console.log("  Test: /login → Send magic link");
