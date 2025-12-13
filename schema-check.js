// FILE: schema-check.js (FULL REPLACEMENT — HARD GUARD)

import { getNotionClient } from "./notion-client.js";
import { NOTION_CONFIG } from "./notion.config.js";

const notion = getNotionClient();

const REQUIRED_PROPERTIES = {
  external_id: "rich_text",
  title: "title",
  created_at: "date"
};

async function check(databaseId, name) {
  const db = await notion.databases.retrieve({ database_id: databaseId });
  const props = db.properties;

  for (const [key, type] of Object.entries(REQUIRED_PROPERTIES)) {
    if (!props[key]) {
      throw new Error(`DB ${name} missing property: ${key}`);
    }
    if (props[key].type !== type) {
      throw new Error(
        `DB ${name} property ${key} must be ${type}, got ${props[key].type}`
      );
    }
  }

  console.log(`✅ ${name} schema OK`);
}

async function run() {
  await check(NOTION_CONFIG.DATABASE_IDS.BRAIN, "BRAIN");
  await check(NOTION_CONFIG.DATABASE_IDS.CORE, "CORE");
}

run();
