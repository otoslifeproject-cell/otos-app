// scripts/notion/client.js
// OTOS Notion client — hard-locked to official SDK defaults.
// Prevents accidental base URL overrides that can cause "invalid_request_url".

import { Client } from "@notionhq/client";

function req(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return String(v).trim();
}

export function notion() {
  const token = req("NOTION_TOKEN");

  // IMPORTANT: do NOT pass any baseUrl here.
  // The official SDK handles the correct API hostname internally.
  return new Client({ auth: token });
}
