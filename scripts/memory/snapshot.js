/**
 * MEMORY SNAPSHOT
 * Exports frozen memory to JSON snapshot (audit + rollback)
 */

import { Client } from "@notionhq/client";
import fs from "fs";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const MEMORY_DB = process.env.BRAIN_DB;

async function run() {
  const pages = await notion.databases.query({
    database_id: MEMORY_DB,
    filter: {
      property: "Frozen",
      checkbox: { equals: true }
    }
  });

  const snapshot = pages.results.map(p => ({
    id: p.id,
    title: p.properties.Title.title[0]?.plain_text || "",
    content: p.properties.Content.rich_text.map(t => t.plain_text).join(""),
    source: p.properties.Source.select.name,
    agent: p.properties.Origin_Agent.select.name,
    timestamp: new Date().toISOString()
  }));

  fs.writeFileSync(
    `snapshots/memory_snapshot_${Date.now()}.json`,
    JSON.stringify(snapshot, null, 2)
  );

  console.log("📸 MEMORY SNAPSHOT WRITTEN");
}

run();
