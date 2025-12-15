/**
 * SYSTEM LIVE ENABLE — CANONICAL (NO ASSUMPTIONS)
 * Enables system live state by writing a single marker row
 * into CORE_DB using the ACTUAL Notion title property.
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

  // 🔒 CANONICAL TITLE PROPERTY NAME (NOT 'Title')
  const TITLE_PROP = "Name";

  await notion.pages.create({
    parent: { database_id: CORE_DB },
    properties: {
      [TITLE_PROP]: {
        title: [
          {
            text: {
              content: "SYSTEM_LIVE",
            },
          },
        ],
      },
      Status: {
        select: { name: "Live" },
      },
      Source: {
        select: { name: "System" },
      },
    },
  });

  console.log("✅ SYSTEM IS LIVE");
}

run().catch((err) => {
  fail(err.message || err);
});
