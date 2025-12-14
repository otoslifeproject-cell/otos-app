import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DB_ID = process.env.OTOS_INTAKE_FEEDER_DB;

const inputText = process.argv.slice(2).join(" ");

if (!inputText) {
  console.error("❌ No intake text provided");
  process.exit(1);
}

await notion.pages.create({
  parent: { database_id: DB_ID },
  properties: {
    Name: {
      title: [
        {
          text: { content: "Andy Intake" },
        },
      ],
    },
    Description: {
      rich_text: [
        {
          text: { content: inputText },
        },
      ],
    },
    Status: {
      select: { name: "Todo" },
    },
    Source: {
      select: { name: "Intake" },
    },
  },
});

console.log("✅ Andy intake saved to OTOS Intake Feeder DB");
