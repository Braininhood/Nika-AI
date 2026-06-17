#!/usr/bin/env node
/**
 * Cross-platform Ollama setup (no Docker).
 * - Writes OLLAMA_* to root .env
 * - Detects install; offers winget (Windows) or install.sh (Linux/macOS)
 * - Starts server if needed; pulls default model
 *
 * Usage: node scripts/setup-ollama.mjs [--install] [--pull]
 *   pnpm setup:ollama
 */
import { spawn, spawnSync, execSync } from "child_process";
import fs from "fs";
import http from "http";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const DEFAULT_BASE = "http://localhost:11434";
const DEFAULT_MODEL = "llama3.2";

function log(msg) {
  console.log(`[setup:ollama] ${msg}`);
}

function commandExists(name) {
  try {
    const cmd =
      process.platform === "win32" ? `where ${name}` : `command -v ${name}`;
    execSync(cmd, { stdio: "ignore", shell: true });
    return true;
  } catch {
    return false;
  }
}

function ollamaBin() {
  if (commandExists("ollama")) return "ollama";
  if (process.platform === "win32") {
    const local = path.join(
      process.env.LOCALAPPDATA || "",
      "Programs",
      "Ollama",
      "ollama.exe",
    );
    if (fs.existsSync(local)) return `"${local}"`;
  }
  return null;
}

function mergeEnv(pairs) {
  const args = pairs.map(([k, v]) => `${k}=${v}`);
  spawnSync("node", [path.join(__dirname, "merge-env.mjs"), ...args], {
    cwd: root,
    stdio: "inherit",
  });
}

function httpTagsOk(baseUrl) {
  return new Promise((resolve) => {
    const url = new URL("/api/tags", baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
    const req = http.get(url, (res) => {
      resolve(res.statusCode === 200);
      res.resume();
    });
    req.on("error", () => resolve(false));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function run(cmd, args = [], opts = {}) {
  const r = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...opts,
  });
  return r.status === 0;
}

async function installOllama() {
  log("Ollama not found — installing…");
  if (process.platform === "win32") {
    if (commandExists("winget")) {
      log("Using winget install Ollama.Ollama …");
      const ok = run("winget", [
        "install",
        "-e",
        "--id",
        "Ollama.Ollama",
        "--accept-package-agreements",
        "--accept-source-agreements",
      ]);
      if (ok) {
        log("Installed. You may need a new terminal, then re-run: pnpm setup:ollama");
        return true;
      }
    }
    log("Install manually: https://ollama.com/download");
    log("Then re-run: pnpm setup:ollama");
    return false;
  }

  log("Using official install script (Linux/macOS)…");
  return run("sh", ["-c", "curl -fsSL https://ollama.com/install.sh | sh"]);
}

async function startServerIfNeeded(bin) {
  if (await httpTagsOk(DEFAULT_BASE)) {
    log("Ollama server already running.");
    return true;
  }

  if (process.platform === "win32") {
    log("On Windows, start the Ollama app from Start Menu (runs in tray).");
    log("Waiting up to 60s for http://localhost:11434 …");
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      if (await httpTagsOk(DEFAULT_BASE)) {
        log("Ollama server is up.");
        return true;
      }
    }
    return false;
  }

  log("Starting `ollama serve` in background…");
  const child = spawn(bin, ["serve"], {
    detached: true,
    stdio: "ignore",
    shell: true,
  });
  child.unref();

  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await httpTagsOk(DEFAULT_BASE)) {
      log("Ollama server started.");
      return true;
    }
  }
  return false;
}

function pullModel(bin, model) {
  log(`Pulling model ${model} (one-time download, free)…`);
  return run(bin, ["pull", model], { shell: true });
}

async function main() {
  const doInstall = process.argv.includes("--install") || !process.argv.includes("--check-only");
  const doPull = process.argv.includes("--pull") || !process.argv.includes("--check-only");

  mergeEnv([
    ["OLLAMA_BASE_URL", DEFAULT_BASE],
    ["OLLAMA_MODEL", DEFAULT_MODEL],
    ["OLLAMA_ENABLED", "true"],
  ]);

  let bin = ollamaBin();

  if (!bin) {
    if (!doInstall) {
      log("Ollama CLI not installed. Run: pnpm setup:ollama --install");
      process.exit(1);
    }
    const installed = await installOllama();
    if (!installed) process.exit(1);
    bin = ollamaBin();
    if (!bin) {
      log("Install finished but `ollama` not on PATH yet. Open a new terminal and re-run.");
      process.exit(1);
    }
  } else {
    log(`Found Ollama CLI: ${bin}`);
  }

  const running = await startServerIfNeeded(bin);
  if (!running) {
    log("Server not reachable. Fix manually, then: pnpm setup:ollama --check-only");
    process.exit(1);
  }

  if (doPull) {
    pullModel(bin, DEFAULT_MODEL);
  }

  log("");
  log("Done. Root .env updated with:");
  log(`  OLLAMA_BASE_URL=${DEFAULT_BASE}`);
  log(`  OLLAMA_MODEL=${DEFAULT_MODEL}`);
  log(`  OLLAMA_ENABLED=true`);
  log("Restart API: pnpm dev:api");
  log("Check: curl http://localhost:8000/health");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
