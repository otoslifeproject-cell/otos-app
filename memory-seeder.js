// FILE: memory-seeder.js (FULL REPLACEMENT — SAFE WRITE, GUARDED)

import fs from "fs";
import { getNotionClient } from "./notion-client.js";
import { NOTION_CONFIG } from "./notion.config.js";

const notion = getNotionClient();

/*
  PURPOSE:
  - Seed historical conversations into Notion
  - Targets: BRAIN + CORE DBs
  - Write-once, idempotent by external_id
  - Safe to re-run (skips existing)

  REQUIREMENTS:
  - conversations.json present locally
  - NOTION_TOKEN in env
*/

const CONVERSATIONS_PATH =
  process.env.CONVERSATIONS_JSON_PATH || "./conversations.json";

if (!fs.existsSync(CONVERSATIONS_PATH)) {
  throw new Error(`Missing conversations file: ${CONVERSATIONS_PATH}`);
}

const conversations = JSON.parse(
  fs.readFileSync(CONVERSATIONS_PATH, "utf8")
);

async function exists(databaseId, externalId) {
  const res = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "external_id",
      rich_text: { equals: externalId }
    }
  });
  return res.results.length > 0;
}

async function write(databaseId, record) {
  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      external_id: {
        rich_text: [{ text: { content: record.id } }]
      },
      title: {
        title: [{ text: { content: record.title || "Conversation" } }]
      },
      created_at: {
        date: { start: record.created_at }
      }
    },
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ text: { content: record.text.slice(0, 1900) } }]
        }
      }
    ]
  });
}

async function seed() {
  let written = 0;
  let skipped = 0;

  for (const convo of conversations) {
    const target =
      convo.type === "core"
        ? NOTION_CONFIG.DATABASE_IDS.CORE
        : NOTION_CONFIG.DATABASE_IDS.BRAIN;

    if (await exists(target, convo.id)) {
      skipped++;
      continue;
    }

    await write(target, convo);
    written++;
  }

  console.log({
    total: conversations.length,
    written,
    skipped
  });
}

seed();
