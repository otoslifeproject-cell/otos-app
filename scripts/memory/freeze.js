/**
 * OTOS Memory Freeze (Canonical)
 * HARD-LOCK SAFE
 * ZERO GUESSING
 */

import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const CORE_DB = process.env.CORE_DB;

if (!CORE_DB) {
  console.error("❌ CORE_DB is missing at runtime");
  console.error("This indicates a workflow wiring fault, not a script fault.");
  process.exit(1);
}

async function ensureStabilityFlag(databaseId) {
  const db = await notion.databases.retrieve({ database_id: databaseId });

  if (db.properties?.Stability_Flag) return;

  await notion.databases.update({
    database_id: databaseId,
    properties: {
      Stability_Flag: { checkbox: {} },
    },
  });
}

async function run() {
  console.log("🧊 Memory Freeze Initialiser starting");
  console.log("CORE_DB:", CORE_DB);

  await ensureStabilityFlag(CORE_DB);

  const pages = await notion.databases.query({
    database_id: CORE_DB,
    page_size: 1,
  });

  if (!pages.results.length) {
    console.log("✅ DB verified (no pages yet)");
    console.log("🔒 Memory frozen");
    return;
  }

  await notion.pages.update({
    page_id: pages.results[0].id,
    properties: {
      Stability_Flag: { checkbox: true },
    },
  });

  console.log("✅ Stability flag applied");
  console.log("🔒 Memory frozen successfully");
}

run().catch((err) => {
  console.error("❌ Memory Freeze FAILED");
  console.error(err);
  process.exit(1);
});
