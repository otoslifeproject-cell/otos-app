/**
 * INGESTS YOUTUBE SOURCE INTO FEEDER
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const FEEDER_DB = process.env.INTAKE_FEEDER_DB;

const url = process.argv[2];
if (!url) {
  console.error("❌ NO YOUTUBE URL PROVIDED");
  process.exit(1);
}

async function run() {
  await notion.pages.create({
    parent: { database_id: FEEDER_DB },
    properties: {
      Source_Type: { select: { name: "YouTube" } },
      Source_URL: { url },
      Processing_Status: { select: { name: "Audio Extracted" } }
    }
  });

  console.log("📥 YOUTUBE SOURCE INGESTED");
}

run();
