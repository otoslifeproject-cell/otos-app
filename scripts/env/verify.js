import process from "node:process";

const REQUIRED = [
  "NOTION_TOKEN",
  "OPENAI_API_KEY",
  "BRAIN_DB",
  "CORE_DB",
  "OPS_DB",
  "OTOS_INTAKE_FEEDER_DB",
  "OTOS_FEEDER_INTAKE_ARCHIVE_DB",
  "OTOS_IDEAS_DB",
  "OTOS_KNOWLEDGE_DB",
  "OTOS_AGENTS_DB"
];

let failed = false;

for (const key of REQUIRED) {
  if (!process.env[key] || process.env[key].trim() === "") {
    console.error(`❌ MISSING ENV: ${key}`);
    failed = true;
  } else {
    console.log(`✅ ENV OK: ${key}`);
  }
}

if (failed) {
  console.error("⛔ Environment verification FAILED");
  process.exit(1);
}

console.log("🟢 Environment verified. Locked.");
process.exit(0);
