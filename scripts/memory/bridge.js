// scripts/memory/bridge.js
import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const CORE_DB = process.env.CORE_DB;
const FEEDER_DB = process.env.FEEDER_DB;

if (!CORE_DB) {
  console.error("❌ CORE_DB is missing");
  process.exit(1);
}

if (!FEEDER_DB) {
  console.error("❌ FEEDER_DB is missing");
  process.exit(1);
}

async function run() {
  console.log("🔗 Memory Bridge starting");
  console.log("CORE_DB:", CORE_DB);
  console.log("FEEDER_DB:", FEEDER_DB);

  // Simple validation calls — no mutation yet
  await notion.databases.retrieve({ database_id: CORE_DB });
  await notion.databases.retrieve({ database_id: FEEDER_DB });

  console.log("✅ Memory Bridge validated both databases");
}

run().catch((err) => {
  console.error("❌ Memory Bridge FAILED");
  console.error(err);
  process.exit(1);
});
