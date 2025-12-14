import { createNotionClient, requireEnv } from "../notion/client.js";

const notion = createNotionClient();
const BRAIN_DB = requireEnv("BRAIN_DB");

const REQUIRED_PROPERTIES = {
  Source: { select: {} },
  Type: { select: {} },
  Status: { select: {} },
  Tags: { multi_select: {} },
  Summary: { rich_text: {} },
  Keywords: { rich_text: {} },
  "AI Notes": { rich_text: {} },
};

async function run() {
  console.log("🧠 Brain DB Auto-Fix starting…");

  const db = await notion.databases.retrieve({ database_id: BRAIN_DB });
  const existing = db.properties;

  let enforced = 0;

  for (const [name, schema] of Object.entries(REQUIRED_PROPERTIES)) {
    if (!existing[name]) {
      await notion.databases.update({
        database_id: BRAIN_DB,
        properties: {
          [name]: schema,
        },
      });
      console.log(`➕ Added property: ${name}`);
      enforced++;
    }
  }

  if (enforced === 0) {
    console.log("🧠 Brain DB already compliant");
  } else {
    console.log(`🧠 Enforced ${enforced} properties`);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
