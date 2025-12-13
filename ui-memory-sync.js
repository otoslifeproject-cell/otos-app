// FILE: ui-memory-sync.js (FULL REPLACEMENT)

import { getNotionClient } from "./notion-client.js";
import { NOTION_CONFIG } from "./notion.config.js";

/*
  PURPOSE:
  - Read BRAIN + CORE
  - Emit minimal JSON for UI consumption
  - NO WRITES
*/

const notion = getNotionClient();

async function fetchAll(databaseId) {
  const results = [];
  let cursor;
  do {
    const res = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor
    });
    results.push(
      ...res.results.map(p => ({
        id: p.id,
        title:
          p.properties.title?.title?.[0]?.plain_text ||
          "Untitled",
        created_at: p.properties.created_at?.date?.start || null
      }))
    );
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

async function run() {
  const brain = await fetchAll(NOTION_CONFIG.DATABASE_IDS.BRAIN);
  const core = await fetchAll(NOTION_CONFIG.DATABASE_IDS.CORE);

  console.log(
    JSON.stringify(
      {
        brain,
        core
      },
      null,
      2
    )
  );
}

run();
