console.log("🧪 SYSTEM READY CHECK starting");

const required = [
  "CORE_DB",
  "INTAKE_DB"
];

let failed = false;

for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env: ${key}`);
    failed = true;
  } else {
    console.log(`✅ ${key} present`);
  }
}

if (failed) {
  console.error("❌ SYSTEM NOT READY");
  process.exit(1);
}

console.log("🟢 SYSTEM READY — GO");
