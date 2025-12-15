/**
 * UI → LIVE CORE ATTACH (Canonical)
 * Zero assumptions. No edits required.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UI_DIR = path.resolve(__dirname, "../../ui");
const FLAG = path.join(UI_DIR, ".LIVE");

function die(msg) {
  console.error("❌ UI LIVE ATTACH FAILED");
  console.error(msg);
  process.exit(1);
}

console.log("🧷 UI LIVE ATTACH starting");

if (!fs.existsSync(UI_DIR)) {
  die("UI directory missing");
}

fs.writeFileSync(
  FLAG,
  JSON.stringify(
    {
      status: "live",
      attached_at: new Date().toISOString(),
    },
    null,
    2
  )
);

console.log("✅ UI ATTACHED TO LIVE SYSTEM");
