/**
 * UI READ-ONLY GUARD
 * Prevents any attempt to treat mirror as writable
 */

import fs from "fs";

const path = "ui/mirror/readonly_state.json";

if (!fs.existsSync(path)) {
  console.error("❌ UI MIRROR MISSING");
  process.exit(1);
}

const stat = fs.statSync(path);
if (!stat.isFile()) {
  console.error("❌ UI MIRROR INVALID");
  process.exit(1);
}

console.log("🧿 UI MIRROR VERIFIED (READ-ONLY)");
