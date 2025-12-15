// scripts/canonical/lock.js
import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const CORE_DB_ID = process.env.CORE_DB;

if (!CORE_DB_ID || CORE_DB_ID.includes("http")) {
  throw new Error(
    "CORE_DB is missing or invalid. Must be a raw Notion database ID."
  );
}

async function run() {
  console.log("🔒 Canonical Lock starting…");

  await notion.databases.update({
    database_id: CORE_DB_ID,
    properties: {
      Canonical_Lock: {
        checkbox: {},
      },
      Canonical_Locked_At: {
        date: {},
      },
    },
  });

  console.log("✅ Canonical properties ensured");

  await notion.pages.create({
    parent: { database_id: CORE_DB_ID },
    properties: {
      Name: {
        title: [{ text: { content: "🔒 Canonical Lock Engaged" } }],
      },
      Canonical_Lock: {
        checkbox: true,
      },
      Canonical_Locked_At: {
        date: { start: new Date().toISOString() },
      },
    },
  });

  console.log("🟢 CANONICAL LOCK COMPLETE");
}

run().catch((err) => {
  console.error("❌ Canonical lock FAILED");
  console.error(err);
  process.exit(1);
});
