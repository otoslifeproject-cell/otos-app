import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function run() {
  const CORE_DB = process.env.CORE_DB;

  console.log("🧠 Memory Anchor Initialiser starting");

  if (!CORE_DB) {
    console.error("❌ CORE_DB is missing");
    process.exit(1);
  }

  console.log(`CORE_DB: ${CORE_DB}`);

  // Validate DB exists & is reachable
  await notion.databases.retrieve({
    database_id: CORE_DB,
  });

  console.log("🧠 Memory anchor verified");

  // Optional: mark a system property or heartbeat write later
  console.log("✅ Memory Anchor initialised");
}

run().catch((err) => {
  console.error("❌ Memory Anchor FAILED");
  console.error(err.message || err);
  process.exit(1);
});
