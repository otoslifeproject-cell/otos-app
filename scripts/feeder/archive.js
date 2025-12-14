/**
 * FEEDER → ARCHIVE TRANSITION
 * Moves processed items into archive
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const FEEDER_DB = process.env.INTAKE_FEEDER_DB;
const ARCHIVE_DB = process.env.INTAKE_ARCHIVE_DB;

async function run() {
  const pages = await notion.databases.query({
    database_id: FEEDER_DB,
    filter: {
      property: "Processing_State",
      select: { equals: "Processed" }
    }
  });

  for (const page of pages.results) {
    await notion.pages.create({
      parent: { database_id: ARCHIVE_DB },
      properties: page.properties
    });

    await notion.pages.update({
      page_id: page.id,
      archived: true
    });
  }

  console.log("📦 FEEDER ITEMS ARCHIVED");
}

run();
