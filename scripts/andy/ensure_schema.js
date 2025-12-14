import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const DB_ID = process.env.OTOS_INTAKE_FEEDER_DB;

if (!DB_ID) {
  throw new Error("Missing OTOS_INTAKE_FEEDER_DB");
}

async function run() {
  const db = await notion.databases.retrieve({ database_id: DB_ID });

  const props = db.properties;

  const updates = {};

  if (!props.Intake) {
    updates.Intake = { title: {} };
  }

  if (!props.Body) {
    updates.Body = { rich_text: {} };
  }

  if (Object.keys(updates).length === 0) {
    console.log("🧠 Intake DB already compliant");
    return;
  }

  await notion.databases.update({
    database_id: DB_ID,
    properties: updates
  });

  console.log("🧠 Intake DB schema enforced:", Object.keys(updates));
}

run();
