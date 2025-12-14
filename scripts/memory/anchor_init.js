/**
 * MEMORY ANCHOR INITIALISER
 * Establishes a permanent, non-editable baseline record for system stability
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const MEMORY_DB = process.env.MEMORY_ANCHOR_DB;

async function run() {
  const existing = await notion.databases.query({
    database_id: MEMORY_DB,
    filter: {
      property: "Anchor_Type",
      select: { equals: "Baseline" }
    }
  });

  if (existing.results.length > 0) {
    console.log("🧠 Memory Anchor already exists. Skipping.");
    return;
  }

  await notion.pages.create({
    parent: { database_id: MEMORY_DB },
    properties: {
      Title: {
        title: [{ text: { content: "SYSTEM BASELINE ANCHOR" } }]
      },
      Anchor_Type: {
        select: { name: "Baseline" }
      },
      Status: {
        select: { name: "Locked" }
      },
      Scope: {
        multi_select: [
          { name: "Core Identity" },
          { name: "Rules" },
          { name: "Memory Model" },
          { name: "Deployment Contract" }
        ]
      },
      Created_At: {
        date: { start: new Date().toISOString() }
      },
      Immutable: {
        checkbox: true
      },
      Notes: {
        rich_text: [
          {
            text: {
              content:
                "This record defines the canonical stability baseline. It must never be edited or deleted."
            }
          }
        ]
      }
    }
  });

  console.log("🔒 MEMORY ANCHOR CREATED");
}

run();
