/**
 * Generates royalty-free demo WAV files + manifest for bundled listening pack.
 * Includes per-accent × per-part audio for all OET English varieties.
 * Run: node scripts/generate-listening-pack.mjs
 */
import { createHash } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packRoot = join(__dirname, "../public/packs/listening-foundation-v1");
const audioDir = join(packRoot, "audio");

const ACCENTS = ["uk", "au", "us", "ie", "nz", "ca", "mixed"];
const PARTS = ["a", "b", "c"];

const ACCENT_BASE_FREQUENCY = {
  uk: 330,
  au: 360,
  us: 400,
  ie: 340,
  nz: 370,
  ca: 390,
  mixed: 420,
};

const PART_OFFSET = { a: 0, b: 20, c: 40 };

function createWav(durationSec = 3, frequencyHz = 440) {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  const writeString = (offset, str) => {
    buffer.write(str, offset, str.length, "ascii");
  };

  writeString(0, "RIFF");
  buffer.writeUInt32LE(36 + dataSize, 4);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  writeString(36, "data");
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i += 1) {
    const t = i / sampleRate;
    const fade = Math.min(1, t * 4, (durationSec - t) * 4);
    const sample = Math.sin(2 * Math.PI * frequencyHz * t) * 0.15 * fade;
    buffer.writeInt16LE(Math.floor(sample * 32767), 44 + i * 2);
  }

  return buffer;
}

const files = [
  // Legacy named clips (universal blocks)
  { path: "audio/part-a-back-pain.wav", freq: 330 },
  { path: "audio/part-a-asthma.wav", freq: 350 },
  { path: "audio/part-b-handover.wav", freq: 440 },
  { path: "audio/part-b-infection.wav", freq: 460 },
  { path: "audio/part-c-telehealth.wav", freq: 520 },
  { path: "audio/part-c-stewardship.wav", freq: 480 },
];

for (const accent of ACCENTS) {
  for (const part of PARTS) {
    const base = ACCENT_BASE_FREQUENCY[accent];
    const freq = base + PART_OFFSET[part];
    files.push({
      path: `audio/accent-${accent}-part-${part}.wav`,
      freq,
    });
  }
}

mkdirSync(audioDir, { recursive: true });

let totalBytes = 0;
const manifestFiles = [];

for (const file of files) {
  const wav = createWav(3, file.freq);
  const fullPath = join(packRoot, file.path);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, wav);
  const sha256 = createHash("sha256").update(wav).digest("hex");
  totalBytes += wav.length;
  manifestFiles.push({ path: file.path, sha256 });
}

const manifest = {
  packId: "listening-foundation-v1",
  version: "1.2.0",
  sizeBytes: totalBytes,
  minAppVersion: "1.0.0",
  files: manifestFiles,
};

writeFileSync(join(packRoot, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`Generated ${files.length} WAV files (${totalBytes} bytes) + manifest.json`);
