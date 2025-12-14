/**
 * LIVE OPERATIONS ENABLEMENT
 * Flips system from build-mode → live-mode
 * Requires prior GO state
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const CORE_DB = process.env.CORE_DB;

async function run() {
  const res = await notion.databases.query({
    database_id: CORE_DB,
    filter: {
      property: "Title",
      title: { equals: "CORE_STABILITY_SEAL" }
    }
  });

  if (res.results.length === 0) {
    console.error("❌ NO CORE SEAL — CANNOT ENABLE LIVE MODE");
    process.exit(1);
  }

  const seal = res.results[0];

  await notion.pages.update({
    page_id: seal.id,
    properties: {
      Live_Mode: {
        checkbox: true
      }
    }
  });

  console.log("🚀 LIVE OPERATIONS ENABLED");
}

run();
