/**
 * LIVE STATUS CONFIRMATION
 * Returns single truth signal
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const CORE_DB = process.env.CORE_DB;

async function run() {
  const res = await notion.databases.query({
    database_id: CORE_DB,
    filter: {
      property: "Live_Mode",
      checkbox: { equals: true }
    }
  });

  if (res.results.length === 0) {
    console.error("🔴 SYSTEM NOT LIVE");
    process.exit(1);
  }

  console.log("🟢 SYSTEM LIVE");
}

run();
