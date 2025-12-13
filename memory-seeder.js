// FILE: memory-seeder.js (FULL REPLACEMENT)

import { Client } from "@notionhq/client";

const skipFiles = process.argv.includes("--skip-files");

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const BRAIN_DB = process.env.BRAIN_DB;
const CORE_DB = process.env.CORE_DB;

if (!NOTION_TOKEN || !BRAIN_DB || !CORE_DB) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

async function writeStubRecord(databaseId, title) {
  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: {
        title: [
          {
            text: { content: title }
          }
        ]
      }
    }
  });
}

async function run() {
  console.log("Memory Seeder starting");

  if (skipFiles) {
    console.log("Skipping file-based ingestion (Notion-only mode)");
  } else {
    console.log("File ingestion disabled by design");
  }

  console.log("Writing to BRAIN DB");
  await writeStubRecord(BRAIN_DB, "Memory Seeder Test Record (BRAIN)");

  console.log("Writing to CORE DB");
  await writeStubRecord(CORE_DB, "Memory Seeder Test Record (CORE)");

  console.log("Completed without errors");
}

run()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Seeder failed:", err);
    process.exit(1);
  });
