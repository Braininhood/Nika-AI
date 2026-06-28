/**
 * Copy API healthcare glossary → web quiz pool (runs automatically via prebuild/predev).
 * Source of truth: apps/api/app/data/healthcare_vocabulary.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");
const repoRoot = path.join(webRoot, "../..");

const SRC = path.join(repoRoot, "apps/api/app/data/healthcare_vocabulary.json");
const DEST = path.join(
  webRoot,
  "src/content/assessment/data/healthcare_vocabulary.json",
);

function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`sync-glossary-quiz: missing source ${SRC}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(SRC, "utf8");
  const data = JSON.parse(raw);
  const count = Object.keys(data).length;

  fs.mkdirSync(path.dirname(DEST), { recursive: true });

  const unchanged =
    fs.existsSync(DEST) && fs.readFileSync(DEST, "utf8") === `${JSON.stringify(data, null, 2)}\n`;

  if (!unchanged) {
    fs.writeFileSync(DEST, `${JSON.stringify(data, null, 2)}\n`);
    console.log(`sync-glossary-quiz: wrote ${count} entries → ${path.relative(webRoot, DEST)}`);
  } else {
    console.log(`sync-glossary-quiz: up to date (${count} entries)`);
  }
}

main();
