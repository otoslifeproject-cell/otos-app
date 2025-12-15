import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const CORE_DB = process.env.CORE_DB;

if (!CORE_DB) {
  console.error("❌ CORE_DB is missing");
  process.exit(1);
}

async function run() {
  console.log("🚀 SYSTEM LIVE ENABLE starting");

  const response = await notion.databases.query({
    database_id: CORE_DB,
    page_size: 1,
  });

  if (!response.results.length) {
    console.error("❌ CORE_DB is empty");
    process.exit(1);
  }

  const pageId = response.results[0].id;

  await notion.pages.update({
    page_id: pageId,
    properties: {
      Name: {
        title: [
          {
            text: {
              content: "OTOS SYSTEM — LIVE",
            },
          },
        ],
      },
      Status: {
        select: {
          name: "LIVE",
        },
      },
    },
  });

  console.log("✅ SYSTEM LIVE ENABLED");
}

run().catch((err) => {
  console.error("❌ SYSTEM LIVE ENABLE FAILED");
  console.error(err);
  process.exit(1);
});
;
