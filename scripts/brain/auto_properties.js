/* eslint-disable no-console */

const { createNotionClient, requireEnv } = require("../notion/client");

async function main() {
  const notion = createNotionClient();
  const BRAIN_DB = requireEnv("NOTION_BRAIN_DB_ID");

  const db = await notion.databases.retrieve({ database_id: BRAIN_DB });

  const required = {
    Summary: { rich_text: {} },
    Content: { rich_text: {} },
    "AI Notes": { rich_text: {} },
    UUID: { rich_text: {} },
    Tags: { multi_select: { options: [] } },
    Status: { select: { options: ["Todo", "Processing", "Ready", "Archived"].map(n => ({ name: n })) } },
    Priority: { select: { options: ["Low", "Medium", "High", "Critical"].map(n => ({ name: n })) } },
  };

  const missing = {};
  for (const [k, v] of Object.entries(required)) {
    if (!db.properties[k]) missing[k] = v;
  }

  if (Object.keys(missing).length) {
    await notion.databases.update({
      database_id: BRAIN_DB,
      properties: missing,
    });
    console.log("🧠 Brain DB properties enforced:", Object.keys(missing));
  } else {
    console.log("🧠 Brain DB already compliant");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
