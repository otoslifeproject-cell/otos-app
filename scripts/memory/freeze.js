/**
 * MEMORY FREEZE
 * Locks memory records as immutable (Core stability)
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const MEMORY_DB = process.env.BRAIN_DB;

async function run() {
  const pages = await notion.databases.query({
    database_id: MEMORY_DB,
    filter: {
      property: "Stability_Flag",
      checkbox: { equals: true }
    }
  });

  for (const page of pages.results) {
    await notion.pages.update({
      page_id: page.id,
      properties: {
        Frozen: { checkbox: true }
      }
    });
  }

  console.log("❄️ MEMORY RECORDS FROZEN");
}

run();
