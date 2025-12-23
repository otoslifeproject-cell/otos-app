/**
 * OTOS – Parent Command Writer
 * Durable authority write → Notion
 *
 * This is the ONLY way Parent commands are issued.
 */

import fetch from "node-fetch";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const PARENT_DB_ID = "2c661113a7c78069bd30ff747451dfd7";

if (!NOTION_TOKEN) {
  console.error("❌ NOTION_TOKEN missing");
  process.exit(1);
}

async function writeParentCommand({
  name,
  description,
  issuedBy = "Dean Parent",
  authority = "ROOT",
  source = "Cockpit"
}) {
  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      parent: { database_id: PARENT_DB_ID },
      properties: {
        Name: {
          title: [{ text: { content: name } }]
        },
        "Command Description": {
          rich_text: [{ text: { content: description } }]
        },
        "Issued By": {
          select: { name: issuedBy }
        },
        "Authority Level": {
          select: { name: authority }
        },
        Status: {
          select: { name: "Issued" }
        },
        Source: {
          select: { name: source }
        },
        Timestamp: {
          date: { start: new Date().toISOString() }
        }
      }
    })
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ Notion write failed:", data);
    process.exit(1);
  }

  console.log("✅ Parent command written:", data.id);
}

export default writeParentCommand;
