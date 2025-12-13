// FILE: notion-client.js (FULL REPLACEMENT — SAFE)

import { Client } from "@notionhq/client";

export function getNotionClient() {
  if (!process.env.NOTION_TOKEN) {
    throw new Error("Missing NOTION_TOKEN in environment");
  }
  return new Client({ auth: process.env.NOTION_TOKEN });
}
