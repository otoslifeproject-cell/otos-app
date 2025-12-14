import { createNotionClient, requireEnv } from "../notion/client.js";

const notion = createNotionClient();
const BRAIN_DB_ID = requireEnv("BRAIN_DB");

const REQUIRED_PROPERTIES = {
  Title: { title: {} },
  UUID: { rich_text: {} },
  Type: {
    select: {
      options: [
        { name: "Insight", color: "blue" },
        { name: "Rule", color: "red" },
        { name: "Memory", color: "green" },
        { name: "System", color: "purple" }
      ]
    }
  },
  Status: {
    select: {
      options: [
        { name: "New", color: "yellow" },
        { name: "Processed", color: "green" },
        { name: "Archived", color: "gray" }
      ]
    }
  },
  Created_At: { date: {} }
};

async function run() {
  const db = await notion.databases.retrieve({ database_id: BRAIN_DB_ID });
  const existing = db.properties || {};

  const toAdd = {};
  for (const [key, schema] of Object.entries(REQUIRED_PROPERTIES)) {
    if (!existing[key]) {
      toAdd[key] = schema;
    }
  }

  if (Object.keys(toAdd).length === 0) {
    console.log("🧠 Brain DB already compliant");
    return;
  }

  await notion.databases.update({
    database_id: BRAIN_DB_ID,
    properties: toAdd
  });

  console.log("🧠 Brain DB properties enforced:", Object.keys(toAdd));
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
