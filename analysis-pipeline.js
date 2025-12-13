// FILE: analysis-pipeline.js (FULL REPLACEMENT — READ-ONLY, DETERMINISTIC)

import { getNotionClient } from "./notion-client.js";
import { NOTION_CONFIG } from "./notion.config.js";

/*
  PURPOSE:
  - Deterministic analysis pass over BRAIN + CORE
  - NO WRITES
  - Produces structured summaries to stdout only
  - Safe, repeatable, side-effect free
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
    results.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  return results;
}

function extractText(blocks) {
  return blocks
    .map(b =>
      b.paragraph?.rich_text
        ?.map(t => t.plain_text)
        .join("") || ""
    )
    .join("\n")
    .trim();
}

async function analyse(databaseId, label) {
  const pages = await fetchAll(databaseId);
  let count = 0;
  let totalChars = 0;

  for (const page of pages) {
    const blocks = await notion.blocks.children.list({
      block_id: page.id
    });

    const text = extractText(blocks.results);
    if (!text) continue;

    count++;
    totalChars += text.length;
  }

  return {
    label,
    records: pages.length,
    analysed: count,
    characters: totalChars
  };
}

async function run() {
  const brain = await analyse(
    NOTION_CONFIG.DATABASE_IDS.BRAIN,
    "BRAIN"
  );
  const core = await analyse(
    NOTION_CONFIG.DATABASE_IDS.CORE,
    "CORE"
  );

  console.log({ brain, core });
}

run();
