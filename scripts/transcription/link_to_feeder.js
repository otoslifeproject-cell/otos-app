/**
 * LINKS TRANSCRIPTION OUTPUT TO FEEDER ENTRY
 */

import { Client } from "@notionhq/client";
import fs from "fs";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const FEEDER_DB = process.env.INTAKE_FEEDER_DB;

async function run() {
  const res = await notion.databases.query({
    database_id: FEEDER_DB,
    sorts: [{ timestamp: "created_time", direction: "descending" }],
    page_size: 1
  });

  const page = res.results[0];

  await notion.pages.update({
    page_id: page.id,
    properties: {
      Transcription_Status: {
        select: { name: "Complete" }
      },
      Transcript_Attached: {
        checkbox: true
      }
    }
  });

  console.log("🔗 TRANSCRIPTION LINKED TO FEEDER");
}

run();
