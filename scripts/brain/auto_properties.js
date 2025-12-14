import { notion, requireEnv } from "../notion/client.js";
import { ENV } from "../_bootstrap/esm-env.js";

requireEnv("BRAIN_DB");

const REQUIRED_PROPERTIES = {
  Title: { title: {} },
  UUID: { rich_text: {} },
  Source: { select: {} },
  Created_At: { date: {} },
  Updated_At: { date: {} },
  Status: { select: {} },
  Embedding_Version: { number: {} },
};

async function run() {
  const dbId = ENV.BRAIN_DB;

  const db = await notion.databases.retrieve({ database_id: dbId });
  const existing = db.properties;

  const missing = {};
  for (const [key, value] of Object.entries(REQUIRED_PROPERTIES)) {
    if (!existing[key]) missing[key] = value;
  }

  if (Object.keys(missing).length === 0) {
    console.log("🧠 Brain DB already compliant");
    return;
  }

  await notion.databases.update({
    database_id: dbId,
    properties: missing,
  });

  console.log("🧠 Enforced Brain DB properties:", Object.keys(missing));
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
