/**
 * BULK AUDIO EXTRACTION FROM FEEDER QUEUE
 * Only processes items marked "Queued"
 */

import { Client } from "@notionhq/client";
import { execSync } from "child_process";
import fs from "fs";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const FEEDER_DB = process.env.INTAKE_FEEDER_DB;
const LIMIT = Number(process.env.LIMIT || 3);

async function run() {
  const res = await notion.databases.query({
    database_id: FEEDER_DB,
    filter: {
      property: "Processing_Status",
      select: { equals: "Queued" }
    },
    page_size: LIMIT
  });

  for (const page of res.results) {
    const url = page.properties.Source_URL.url;
    console.log("🎧 EXTRACTING:", url);

    execSync(
      `yt-dlp -x --audio-format mp3 "${url}" -o "outputs/youtube_audio/%(title)s.%(ext)s"`,
      { stdio: "inherit" }
    );

    await notion.pages.update({
      page_id: page.id,
      properties: {
        Processing_Status: { select: { name: "Audio Extracted" } }
      }
    });
  }

  console.log("✅ BULK AUDIO PASS COMPLETE");
}

run();
