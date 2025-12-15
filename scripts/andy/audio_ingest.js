/**
 * ANDY AUDIO INGEST
 * Registers an audio file reference for later transcription
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const FEEDER_DB = process.env.INTAKE_FEEDER_DB;

const ref = process.argv.slice(2).join(" ");
if (!ref) {
  console.error("❌ MISSING AUDIO REFERENCE");
  process.exit(1);
}

async function run() {
  await notion.pages.create({
    parent: { database_id: FEEDER_DB },
    properties: {
      Title: {
        title: [{ text: { content: "Audio Ingest" } }]
      },
      Raw_Input: {
        rich_text: [{ text: { content: ref } }]
      },
      Source_Type: {
        select: { name: "Audio" }
      },
      Processing_State: {
        select: { name: "Received" }
      },
      Agent: {
        select: { name: "ANDY" }
      }
    }
  });

  console.log("🎧 AUDIO INGEST REGISTERED");
}

run();
