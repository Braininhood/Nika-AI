import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "../src/content/writing/scenarios");
const files = ["pharmacy.ts", "nursing.ts", "medicine.ts", "allied-health.ts"];
const entries = [];

for (const file of files) {
  const text = fs.readFileSync(path.join(dir, file), "utf8");
  const re =
    /id: "(w-[^"]+)"[\s\S]*?profession: "([^"]+)"[\s\S]*?difficulty: (\d)[\s\S]*?title: "([^"]+)"[\s\S]*?letterType: "([^"]+)"[\s\S]*?countryCode: "([^"]+)"/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    entries.push({
      id: match[1],
      profession: match[2],
      difficulty: Number(match[3]),
      title: match[4],
      letterType: match[5],
      countryCode: match[6],
    });
  }
}

const out = path.join(__dirname, "../../api/app/data/writing_scenarios.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(entries, null, 2)}\n`);
console.log(`Wrote ${entries.length} scenarios to ${out}`);
