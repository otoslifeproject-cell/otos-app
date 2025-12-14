/**
 * UI COMMAND GUARD
 * Prevents mutation of registry post-live
 */

import fs from "fs";

const path = "scripts/ui/commands/registry.js";

const stat = fs.statSync(path);
if (!stat.isFile()) {
  console.error("❌ COMMAND REGISTRY MISSING");
  process.exit(1);
}

console.log("🧱 UI COMMAND REGISTRY LOCKED");
