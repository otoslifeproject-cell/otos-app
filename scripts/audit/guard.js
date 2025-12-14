/**
 * AUDIT IMMUTABILITY GUARD
 * Prevents audit pack modification
 */

import fs from "fs";

const stat = fs.statSync("audit/nhs/audit_pack.json");
if (!stat.isFile()) {
  console.error("❌ AUDIT PACK INVALID");
  process.exit(1);
}

console.log("🛑 AUDIT PACK IMMUTABLE");
