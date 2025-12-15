/**
 * OPERATIONAL STATUS CHECK
 * Confirms system is in daily mode
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const OPS_DB = process.env.OPS_DB;

async function run() {
  const res = await notion.databases.query({
    database_id: OPS_DB,
    filter: {
      property: "Title",
      title: { equals: "OPERATIONAL_MODE_ENABLED" }
    }
  });

  if (res.results.length === 0) {
    console.error("🔴 NOT IN DAILY MODE");
    process.exit(1);
  }

  console.log("🟢 SYSTEM IN DAILY OPERATIONS MODE");
}

run();
