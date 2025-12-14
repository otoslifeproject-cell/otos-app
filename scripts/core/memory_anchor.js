/**
 * OTOS — Memory Anchor Initialiser
 * Creates the AI Core Operating Contract anchor
 */

import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const CORE_DB = process.env.CORE_DB;

if (!CORE_DB) {
  console.error("❌ CORE_DB env var missing");
  process.exit(1);
}

const CONTRACT_URL =
  "https://github.com/otoslifeproject-cell/otos-app/blob/main/governance/AI_CORE_CONTRACT.md";

(async () => {
  console.log("🔐 Creating Memory Anchor…");

  await notion.pages.create({
    parent: { database_id: CORE_DB },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: "AI Core Operating Contract",
            },
          },
        ],
      },

      Type: {
        select: { name: "Governance" },
      },

      Status: {
        select: { name: "Active" },
      },

      Priority: {
        select: { name: "Highest" },
      },

      Source: {
        select: { name: "GitHub" },
      },

      Canonical_Link: {
        url: CONTRACT_URL,
      },

      Notes: {
        rich_text: [
          {
            text: {
              content:
                "Binding operating contract for OTOS Core Intelligence. Must be referenced before execution or architectural changes.",
            },
          },
        ],
      },
    },
  });

  console.log("✅ Memory Anchor created successfully");
  process.exit(0);
})().catch((err) => {
  console.error("❌ Memory Anchor creation failed");
  console.error(err.body || err);
  process.exit(1);
});
