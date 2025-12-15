// scripts/system/live_enable.js
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const CORE_DB = process.env.CORE_DB;

if (!CORE_DB) {
  console.error("❌ CORE_DB missing at runtime");
  process.exit(1);
}

console.log("🚀 LIVE OPERATIONS ENABLE starting");
console.log("CORE_DB:", CORE_DB);

async function run() {
  // Notion databases do NOT have a property called "Title"
  // They have a title-type property with an arbitrary name.
  // We must read the schema dynamically.

  const db = await notion.databases.retrieve({ database_id: CORE_DB });

  const titlePropName = Object.entries(db.properties).find(
    ([_, prop]) => prop.type === "title"
  )?.[0];

  if (!titlePropName) {
    console.error("❌ No title property found in CORE_DB");
    process.exit(1);
  }

  await notion.pages.create({
    parent: { database_id: CORE_DB },
    properties: {
      [titlePropName]: {
        title: [
          {
            text: {
              content: "LIVE_OPERATIONS_ENABLED",
            },
          },
        ],
      },
      System_Status: {
        select: { name: "LIVE" },
      },
      Stability_Flag: {
        select: { name: "LOCKED" },
      },
    },
  });

  console.log("✅ LIVE OPERATIONS ENABLED");
}

run().catch((err) => {
  console.error("❌ LIVE ENABLE FAILED");
  console.error(err);
  process.exit(1);
});
