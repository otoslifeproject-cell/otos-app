/**
 * NHS AUDIT VALIDATOR
 * Ensures audit pack completeness
 */

import fs from "fs";

const required = [
  "audit/nhs/audit_pack.json",
  "audit/nhs/README.md"
];

for (const f of required) {
  if (!fs.existsSync(f)) {
    console.error("❌ MISSING AUDIT FILE:", f);
    process.exit(1);
  }
}

console.log("✅ NHS AUDIT PACK VERIFIED");
