// FILE: notion-sync.js (FULL REPLACEMENT — READ ONLY)

import { getNotionClient } from "./notion-client.js";
import { NOTION_CONFIG } from "./notion.config.js";

const notion = getNotionClient();

async function queryDB(databaseId) {
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

export async function readAll() {
  return {
    projects: await queryDB(NOTION_CONFIG.DATABASE_IDS.PROJECTS),
    tasks: await queryDB(NOTION_CONFIG.DATABASE_IDS.TASKS),
    knowledge: await queryDB(NOTION_CONFIG.DATABASE_IDS.KNOWLEDGE),

    intake_feeder: await queryDB(NOTION_CONFIG.DATABASE_IDS.INTAKE_FEEDER),
    intake_archive: await queryDB(NOTION_CONFIG.DATABASE_IDS.INTAKE_ARCHIVE),

    agents: await queryDB(NOTION_CONFIG.DATABASE_IDS.AGENTS),
    ops: await queryDB(NOTION_CONFIG.DATABASE_IDS.OPS),

    brain: await queryDB(NOTION_CONFIG.DATABASE_IDS.BRAIN),
    core: await queryDB(NOTION_CONFIG.DATABASE_IDS.CORE)
  };
}

// Allow CLI run
if (process.argv[1]?.includes("notion-sync.js")) {
  readAll().then(res => {
    console.log(
      Object.fromEntries(
        Object.entries(res).map(([k, v]) => [k, v.length])
      )
    );
  });
}
