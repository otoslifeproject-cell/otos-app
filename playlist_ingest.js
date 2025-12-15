/**
 * BULK PLAYLIST INGEST (CONTROLLED)
 * - Fetches playlist entries
 * - Rate-limited batching
 * - Pushes each video to Feeder as "Queued"
 */

import { execSync } from "child_process";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const FEEDER_DB = process.env.INTAKE_FEEDER_DB;

const playlistUrl = process.argv[2];
const BATCH_SIZE = Number(process.env.BATCH_SIZE || 5);
const SLEEP_MS = Number(process.env.SLEEP_MS || 3000);

if (!playlistUrl) {
  console.error("❌ NO PLAYLIST URL PROVIDED");
  process.exit(1);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getPlaylistUrls(url) {
  const out = execSync(
    `yt-dlp --flat-playlist -J "${url}"`,
    { encoding: "utf-8" }
  );
  const json = JSON.parse(out);
  return json.entries.map(e => `https://www.youtube.com/watch?v=${e.id}`);
}

async function ingest(url) {
  await notion.pages.create({
    parent: { database_id: FEEDER_DB },
    properties: {
      Source_Type: { select: { name: "YouTube" } },
      Source_URL: { url },
      Processing_Status: { select: { name: "Queued" } }
    }
  });
}

async function run() {
  const urls = getPlaylistUrls(playlistUrl);
  console.log(`📦 PLAYLIST ITEMS: ${urls.length}`);

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    console.log(`▶️ INGESTING ${i + 1}–${i + batch.length}`);

    for (const url of batch) {
      await ingest(url);
    }

    if (i + BATCH_SIZE < urls.length) {
      console.log("⏸️ RATE LIMIT PAUSE");
      await sleep(SLEEP_MS);
    }
  }

  console.log("✅ PLAYLIST INGEST COMPLETE");
}

run();
