// FILE: scripts/hlr_writer.js
// PURPOSE: Immutable Hard Log Register writer (HLR)
// MODE: Append-only. No updates. No deletes.

import fetch from "node-fetch";

const NOTION_API = "https://api.notion.com/v1/pages";
const NOTION_VERSION = "2022-06-28";

function required(name) {
  if (!process.env[name]) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return process.env[name];
}

const NOTION_TOKEN = required("NOTION_TOKEN");
const HLR_DB = required("HARD_LOG_REGISTER_DB");

export async function writeHLR({
  source,
  actor,
  action,
  payload = {},
  severity = "INFO"
}) {
  const body = {
    parent: { database_id: HLR_DB },
    properties: {
      Timestamp: { date: { start: new Date().toISOString() } },
      Source: { title: [{ text: { content: source } }] },
      Actor: { rich_text: [{ text: { content: actor } }] },
      Action: { rich_text: [{ text: { content: action } }] },
      Severity: { select: { name: severity } },
      Payload: {
        rich_text: [
          { text: { content: JSON.stringify(payload).slice(0, 2000) } }
        ]
      }
    }
  };

  const res = await fetch(NOTION_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HLR write failed: ${t}`);
  }

  return res.json();
}
