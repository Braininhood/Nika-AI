#!/usr/bin/env node
/**
 * Upsert keys in repo root .env (creates file if missing).
 * Usage: node scripts/merge-env.mjs KEY=value KEY2=value2
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env");

const updates = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const i = arg.indexOf("=");
    if (i < 1) throw new Error(`Invalid arg (use KEY=value): ${arg}`);
    return [arg.slice(0, i), arg.slice(i + 1)];
  }),
);

if (!Object.keys(updates).length) {
  console.error("No KEY=value pairs provided.");
  process.exit(1);
}

let lines = [];
if (fs.existsSync(envPath)) {
  lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
}

const seen = new Set();
const out = [];

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    out.push(line);
    continue;
  }
  const eq = line.indexOf("=");
  if (eq < 1) {
    out.push(line);
    continue;
  }
  const key = line.slice(0, eq).trim();
  if (Object.prototype.hasOwnProperty.call(updates, key)) {
    out.push(`${key}=${updates[key]}`);
    seen.add(key);
  } else {
    out.push(line);
  }
}

for (const [key, value] of Object.entries(updates)) {
  if (!seen.has(key)) {
    if (out.length && out[out.length - 1] !== "") out.push("");
    out.push(`# ── ${key} (added by setup script) ──`);
    out.push(`${key}=${value}`);
  }
}

fs.writeFileSync(envPath, out.join("\n").replace(/\n*$/, "\n"), "utf8");
console.log(`Updated ${envPath}: ${Object.keys(updates).join(", ")}`);
