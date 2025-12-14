/**
 * MEMORY SNAPSHOT
 * Exports full memory DB state for rollback safety
 */

import fs from "fs";
import path from "path";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const MEMORY_DB = process.env.MEMORY_ANCHOR_DB;

const SNAPSHOT_DIR = "memory/_snapshots";

async function run() {
  const snapshot = await notion.databases.query({
    database_id: MEMORY_DB
  });

  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });

  const file = path.join(
    SNAPSHOT_DIR,
    `snapshot_${Date.now()}.json`
  );

  fs.writeFileSync(file, JSON.stringify(snapshot, null, 2), "utf8");

  console.log(`📸 MEMORY SNAPSHOT SAVED → ${file}`);
}

run();
