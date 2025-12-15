/**
 * OTOS Memory Freeze (Canonical)
 * HARD-LOCK SAFE
 * This script WILL NOT fail if Stability_Flag is missing.
 * It auto-detects or creates the required property.
 */

import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const CORE_DB = process.env.CORE_DB;

if (!CORE_DB) {
  console.error("❌ CORE_DB is missing");
  process.exit(1);
}

async function ensureStabilityFlag(databaseId) {
  const db = await notion.databases.retrieve({ database_id: databaseId });
  const properties = db.properties;

  if (properties.Stability_Flag) {
    return "Stability_Flag";
  }

  // Create Stability_Flag safely
  await notion.databases.update({
    database_id: databaseId,
    properties: {
      Stability_Flag: {
        checkbox: {},
      },
    },
  });

  return "Stability_Flag";
}

async function run() {
  console.log("🧊 Memory Freeze Initialiser starting");
  console.log("CORE_DB:", CORE_DB);

  const flagName = await ensureStabilityFlag(CORE_DB);

  const pages = await notion.databases.query({
    database_id: CORE_DB,
    page_size: 1,
  });

  if (!pages.results.length) {
    console.log("⚠️ No pages found to freeze (DB valid)");
    console.log("✅ Memory state frozen (empty DB)");
    return;
  }

  const pageId = pages.results[0].id;

  await notion.pages.update({
    page_id: pageId,
    properties: {
      [flagName]: {
        checkbox: true,
      },
    },
  });

  console.log("✅ Stability flag applied");
  console.log("🔒 Memory frozen successfully");
}

run().catch((err) => {
  console.error("❌ Memory Freeze FAILED");
  console.error(err.message || err);
  process.exit(1);
});

