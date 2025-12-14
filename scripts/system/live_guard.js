/**
 * LIVE MODE GUARD
 * Ensures no build-only scripts can run post-GO
 */

const blocked = [
  "scripts/memory/freeze.js",
  "scripts/core/stability_seal.js"
];

for (const file of blocked) {
  if (process.argv[1]?.includes(file)) {
    console.error("❌ BLOCKED: BUILD SCRIPT IN LIVE MODE");
    process.exit(1);
  }
}

console.log("🟢 LIVE MODE GUARD PASSED");
