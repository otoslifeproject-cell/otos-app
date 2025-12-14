/**
 * OPERATIONAL DAILY MODE
 * Declares system in day-to-day use (post-live)
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const OPS_DB = process.env.OPS_DB;

async function run() {
  await notion.pages.create({
    parent: { database_id: OPS_DB },
    properties: {
      Title: {
        title: [{ text: { content: "OPERATIONAL_MODE_ENABLED" } }]
      },
      Timestamp: {
        date: { start: new Date().toISOString() }
      },
      Status: {
        select: { name: "Daily" }
      }
    }
  });

  console.log("📘 DAILY OPERATIONS ENABLED");
}

run();
