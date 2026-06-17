/**
 * Upload Layer B content pack to Supabase Storage (content-packs bucket).
 *
 * Prerequisites:
 *   - Run migration: supabase/migrations/20250614120000_content_packs_storage.sql
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in environment
 *   - Generate local pack first: node scripts/generate-listening-pack.mjs
 *
 * Usage:
 *   cd apps/web
 *   node scripts/upload-content-pack.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "fs";
import { dirname, join, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Load repo root .env then apps/web/.env.local (does not override existing env). */
function loadEnvFiles() {
  for (const rel of ["../../../.env", "../.env.local"]) {
    const path = join(__dirname, rel);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnvFiles();
const packId = process.env.CONTENT_PACK_ID ?? "listening-foundation-v1";
const packRoot = join(__dirname, `../public/packs/${packId}`);
const bucket = process.env.CONTENT_PACKS_BUCKET ?? "content-packs";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Add them to D:\\Nika AI\\.env (repo root) or set in shell before running.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function sha256File(path) {
  const buf = readFileSync(path);
  return createHash("sha256").update(buf).digest("hex");
}

async function uploadFile(absPath) {
  const rel = relative(packRoot, absPath).replace(/\\/g, "/");
  const storagePath = `${packId}/${rel}`;
  const body = readFileSync(absPath);
  const contentType = rel.endsWith(".json")
    ? "application/json"
    : rel.endsWith(".wav")
      ? "audio/wav"
      : "application/octet-stream";

  const { error } = await supabase.storage.from(bucket).upload(storagePath, body, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`${storagePath}: ${error.message}`);
  console.log(`Uploaded ${storagePath}`);
}

const files = walk(packRoot);
let totalBytes = 0;
const manifestFiles = [];

for (const f of files) {
  if (f.endsWith("manifest.json")) continue;
  const rel = relative(packRoot, f).replace(/\\/g, "/");
  totalBytes += statSync(f).size;
  manifestFiles.push({ path: rel, sha256: sha256File(f) });
}

const manifest = {
  packId,
  version: process.env.CONTENT_PACK_VERSION ?? "1.1.0",
  sizeBytes: totalBytes,
  minAppVersion: "1.0.0",
  files: manifestFiles,
};

writeFileSync(join(packRoot, "manifest.json"), JSON.stringify(manifest, null, 2));
files.push(join(packRoot, "manifest.json"));

for (const f of [...new Set(files)]) {
  await uploadFile(f);
}

console.log(`Done. Public URL: ${url}/storage/v1/object/public/${bucket}/${packId}/manifest.json`);
