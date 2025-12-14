/**
 * Andy Agent — Intake (Canonical)
 * Single-write, schema-safe, supervised
 */

import { Client } from "@notionhq/client";
import { randomUUID } from "crypto";

// --- ENV ---
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const INTAKE_DB = process.env.OTOS_INTAKE_FEEDER_DB;

if (!NOTION_TOKEN || !INTAKE_DB) {
  console.error("❌ Missing NOTION_TOKEN or OTOS_INTAKE_FEEDER_DB");
  process.exit(1);
}

// --- INPUT ---
const inputText = process.argv.slice(2).join(" ").trim();
if (!inputText) {
  console.error("❌ No intake text provided");
  process.exit(1);
}

// --- CLIENT ---
const notion = new Client({ auth: NOTION_TOKEN });

// --- MAIN ---
(async () => {
  console.log("🟢 Andy Intake starting…");

  const now = new Date().toISOString();
  const uuid = randomUUID();

  await notion.pages.create({
    parent: { database_id: INTAKE_DB },
    properties: {
      Name: {
        title: [
          {
            text: { content: "Andy Intake" }
          }
        ]
      },

      Source: {
        select: { name: "Andy" }
      },

      Status: {
        select: { name: "Todo" }
      },

      Priority: {
        select: { name: "Normal" }
      },

      Description: {
        rich_text: [
          {
            text: { content: inputText }
          }
        ]
      },

      Created_At: {
        date: { start: now }
      },

      UUID: {
        rich_text: [
          {
            text: { content: uuid }
          }
        ]
      }
    }
  });

  console.log("✅ Andy intake written successfully");
  console.log(`🧾 UUID: ${uuid}`);
  process.exit(0);

})().catch(err => {
  console.error("❌ Andy intake FAILED");
  console.error(err);
  process.exit(1);
});
