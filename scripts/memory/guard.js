/**
 * MEMORY GUARD
 * Prevents mutation of baseline anchor
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const MEMORY_DB = process.env.MEMORY_ANCHOR_DB;

async function run() {
  const anchors = await notion.databases.query({
    database_id: MEMORY_DB,
    filter: {
      property: "Anchor_Type",
      select: { equals: "Baseline" }
    }
  });

  for (const page of anchors.results) {
    if (!page.properties.Immutable.checkbox) {
      console.error("❌ BASELINE MUTATION DETECTED");
      process.exit(1);
    }
  }

  console.log("🛡️ MEMORY BASELINE VERIFIED");
}

run();

