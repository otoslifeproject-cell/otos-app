/**
 * ANDY CAPABILITY GUARD
 * Prevents ANDY from writing outside feeder + archive
 */

const forbidden = ["CORE_DB", "BRAIN_DB"];

for (const key of forbidden) {
  if (process.env[key]) {
    console.error("❌ ANDY HAS FORBIDDEN ENV ACCESS:", key);
    process.exit(1);
  }
}

console.log("🛡️ ANDY CAPABILITY GUARD PASSED");
