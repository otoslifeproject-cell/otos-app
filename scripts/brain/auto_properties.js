// scripts/brain/auto_properties.js
import { Client } from "@notionhq/client";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const notion = new Client({ auth: requireEnv("NOTION_TOKEN") });

const BRAIN_DB_ID = requireEnv("BRAIN_DB");

const REQUIRED_PROPERTIES = {
  UUID: { rich_text: {} },
  Source: { select: { options: [] } },
  Status: { select: { options: [] } },
  Tags: { multi_select: { options: [] } },
  Created_At: { date: {} },
  Updated_At: { date: {} },
  Vector_Status: { select: { options: [] } }
};

async function run() {
  const db = await notion.databases.retrieve({ database_id: BRAIN_DB_ID });

  const existing = db.properties || {};
  const updates = {};

  for (const [name, schema] of Object.entries(REQUIRED_PROPERTIES)) {
    if (!existing[name]) {
      updates[name] = schema;
    }
  }

  if (Object.keys(updates).length === 0) {
    console.log("Brain DB already compliant");
    return;
  }

  await notion.databases.update({
    database_id: BRAIN_DB_ID,
    properties: updates
  });

  console.log("Brain DB updated with properties:", Object.keys(updates));
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
