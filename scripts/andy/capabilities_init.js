/**
 * ANDY CAPABILITY FLAGS
 * Enables controlled skills without expanding write scope
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const AGENTS_DB = process.env.AGENTS_DB;

async function run() {
  const res = await notion.databases.query({
    database_id: AGENTS_DB,
    filter: {
      property: "Agent_Name",
      title: { equals: "ANDY" }
    }
  });

  if (res.results.length === 0) {
    console.error("❌ ANDY NOT FOUND");
    process.exit(1);
  }

  const page = res.results[0];

  await notion.pages.update({
    page_id: page.id,
    properties: {
      Capabilities: {
        multi_select: [
          { name: "Audio Transcription" },
          { name: "YouTube Extraction" },
          { name: "Text Intake" }
        ]
      }
    }
  });

  console.log("🧩 ANDY CAPABILITIES ENABLED");
}

run();
