// FILE: analysis-pipeline.js (FULL REPLACEMENT)

import { getNotionClient } from "./notion-client.js";
import { NOTION_CONFIG } from "./notion.config.js";

const notion = getNotionClient();

async function fetchAll(databaseId) {
  const results = [];
  let cursor;
  do {
    const res = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor
    });
    results.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

async function run() {
  const brain = await fetchAll(NOTION_CONFIG.DATABASE_IDS.BRAIN);
  const core = await fetchAll(NOTION_CONFIG.DATABASE_IDS.CORE);

  console.log({
    brain_records: brain.length,
    core_records: core.length
  });
}

run();
