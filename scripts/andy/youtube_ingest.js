/**
 * ANDY YOUTUBE INGEST
 * Accepts a YouTube URL and stores metadata + transcript placeholder
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const FEEDER_DB = process.env.INTAKE_FEEDER_DB;

const url = process.argv[2];
if (!url) {
  console.error("❌ MISSING YOUTUBE URL");
  process.exit(1);
}

async function run() {
  await notion.pages.create({
    parent: { database_id: FEEDER_DB },
    properties: {
      Title: {
        title: [{ text: { content: "YouTube Ingest" } }]
      },
      Raw_Input: {
        rich_text: [{ text: { content: url } }]
      },
      Source_Type: {
        select: { name: "YouTube" }
      },
      Processing_State: {
        select: { name: "Received" }
      },
      Agent: {
        select: { name: "ANDY" }
      }
    }
  });

  console.log("📺 YOUTUBE INGEST REGISTERED");
}

run();
