/**
 * SYSTEM LIVE ENABLE — MINIMAL / GUARANTEED
 * Writes ONE row using ONLY the guaranteed Notion title property.
 * ZERO optional fields. ZERO assumptions.
 */

import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const CORE_DB = process.env.CORE_DB;

function fail(msg) {
  console.error("❌ SYSTEM LIVE ENABLE FAILED");
  console.error(msg);
  process.exit(1);
}

async function run() {
  console.log("🚀 SYSTEM LIVE ENABLE starting");

  if (!CORE_DB) {
    fail("CORE_DB missing");
  }

  // ⚠️ CANONICAL NOTION TITLE PROPERTY
  // Notion ALWAYS has exactly ONE title property
  // We reference it by type, not by guessed name
  const db = await notion.databases.retrieve({ database_id: CORE_DB });

  const titleProp = Object.entries(db.properties).find(
    ([, prop]) => prop.type === "title"
  );

  if (!titleProp) {
    fail("No title property found in CORE_DB");
  }

  const [TITLE_KEY] = titleProp;

  await notion.pages.create({
    parent: { database_id: CORE_DB },
    properties: {
      [TITLE_KEY]: {
        title: [
          {
            text: { content: "SYSTEM_LIVE" },
          },
        ],
      },
    },
  });

  console.log("✅ SYSTEM IS LIVE");
}

run().catch((err) => fail(err.message || err));
