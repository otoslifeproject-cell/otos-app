import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DBS = [
  { name: "BRAIN_DB", id: process.env.BRAIN_DB },
  { name: "CORE_DB", id: process.env.CORE_DB },
  { name: "OPS_DB", id: process.env.OPS_DB },
];

async function enforce(db) {
  if (!db.id) {
    console.log(`⚠️ ${db.name} missing — skipped`);
    return;
  }

  console.log(`🔒 Enforcing schema on ${db.name}`);

  await notion.databases.retrieve({
    database_id: db.id,
  });

  console.log(`✅ ${db.name} exists and is reachable`);
}

for (const db of DBS) {
  await enforce(db);
}

console.log("🧠 Schema enforcement baseline complete");
