import { Client } from "@notionhq/client";

const REQUIRED_ENV = [
  "NOTION_TOKEN",
  "CORE_DB",
  "OTOS_INTAKE_FEEDER_DB"
];

function fail(msg) {
  console.error("❌ SYSTEM READY CHECK FAILED");
  console.error(msg);
  process.exit(1);
}

async function run() {
  console.log("🧪 System Ready Check starting");

  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      fail(`Missing required env var: ${key}`);
    }
  }

  const notion = new Client({
    auth: process.env.NOTION_TOKEN
  });

  const coreDb = process.env.CORE_DB;
  const feederDb = process.env.OTOS_INTAKE_FEEDER_DB;

  try {
    await notion.databases.retrieve({ database_id: coreDb });
    console.log("✅ CORE_DB verified");
  } catch {
    fail("CORE_DB invalid or not accessible");
  }

  try {
    await notion.databases.retrieve({ database_id: feederDb });
    console.log("✅ FEEDER_DB verified");
  } catch {
    fail("FEEDER_DB invalid or not accessible");
  }

  console.log("🟢 SYSTEM READY");
  console.log("All mandatory layers present");
}

run();
