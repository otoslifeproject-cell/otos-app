// FILE: scripts/ui/attach_live.js
// FULL REPLACEMENT — COPY / PASTE EXACTLY
// Purpose: Attach local UI (Notion_Injection OR ui) into live-ready state
// Zero assumptions. Hard guards only.

import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const CANDIDATES = [
  "Notion_Injection",
  "ui",
  "UI",
  "notion_injection"
];

function findUIDir() {
  for (const dir of CANDIDATES) {
    const full = path.join(ROOT, dir);
    if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
      return full;
    }
  }
  return null;
}

console.log("🧷 UI LIVE ATTACH starting");

const uiDir = findUIDir();

if (!uiDir) {
  console.error("❌ UI LIVE ATTACH FAILED");
  console.error("No UI directory found. Expected one of:");
  CANDIDATES.forEach(d => console.error(" - " + d));
  process.exit(1);
}

const LIVE_DIR = path.join(ROOT, "runtime", "ui");

fs.mkdirSync(LIVE_DIR, { recursive: true });

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    if (fs.statSync(s).isDirectory()) {
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

copyRecursive(uiDir, LIVE_DIR);

console.log("✅ UI directory detected:", path.basename(uiDir));
console.log("✅ UI copied into runtime/ui");
console.log("🟢 UI LIVE ATTACH COMPLETE");
process.exit(0);
