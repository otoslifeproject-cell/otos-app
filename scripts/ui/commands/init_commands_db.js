/**
 * UI COMMANDS DB INITIALISER
 * Registers commands into Notion for UI discovery
 */

import { Client } from "@notionhq/client";
import { COMMANDS } from "./registry.js";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const OPS_DB = process.env.OPS_DB;

async function run() {
  for (const key of Object.keys(COMMANDS)) {
    const c = COMMANDS[key];
    await notion.pages.create({
      parent: { database_id: OPS_DB },
      properties: {
        Title: {
          title: [{ text: { content: c.id } }]
        },
        Description: {
          rich_text: [{ text: { content: c.description } }]
        },
        Script: {
          rich_text: [{ text: { content: c.script } }]
        },
        Role: {
          select: { name: c.role }
        },
        Enabled: {
          checkbox: true
        }
      }
    });
  }
  console.log("🎚️ UI COMMANDS REGISTERED");
}

run();
