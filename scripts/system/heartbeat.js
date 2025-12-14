/**
 * LIVE HEARTBEAT
 * Emits proof-of-life for audits & uptime tracking
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const OPS_DB = process.env.OPS_DB;

async function run() {
  await notion.pages.create({
    parent: { database_id: OPS_DB },
    properties: {
      Title: {
        title: [{ text: { content: "SYSTEM_HEARTBEAT" } }]
      },
      Timestamp: {
        date: { start: new Date().toISOString() }
      },
      Status: {
        select: { name: "Alive" }
      }
    }
  });

  console.log("❤️ SYSTEM HEARTBEAT EMITTED");
}

run();
