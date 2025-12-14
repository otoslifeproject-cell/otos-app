// Andy Agent v1 — Intake → Notion Feeder DB (ESM, Node 20)

import { Client } from "@notionhq/client";

const required = (k) => {
  if (!process.env[k]) throw new Error(`Missing env ${k}`);
  return process.env[k];
};

const notion = new Client({ auth: required("NOTION_TOKEN") });

const FEEDER_DB = required("OTOS_INTAKE_FEEDER_DB");

const text = process.argv.slice(2).join(" ").trim();
if (!text) {
  console.error("No input text provided");
  process.exit(1);
}

await notion.pages.create({
  parent: { database_id: FEEDER_DB },
  properties: {
    Name: { title: [{ text: { content: "Andy Intake" } }] },
    Source: { select: { name: "Andy" } },
    Status: { select: { name: "New" } },
    Content: { rich_text: [{ text: { content: text } }] }
  }
});

console.log("✅ Andy intake recorded");
