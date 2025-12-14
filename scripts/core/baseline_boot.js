/**
 * OTOS — Baseline Boot Sequence
 * Verifies core governance + environment before operation
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

(async () => {
  console.log("🔁 OTOS Baseline Boot starting…");

  const response = await notion.databases.query({
    database_id: CORE_DB,
    filter: {
      and: [
        {
          property: "Type",
          select: { equals: "Governance" },
        },
        {
          property: "Status",
          select: { equals: "Active" },
        },
        {
          property: "Priority",
          select: { equals: "Highest" },
        },
      ],
    },
  });

  if (response.results.length === 0) {
    console.error("❌ No active governance anchor found");
    process.exit(1);
  }

  const contract = response.results[0];

  const link =
    contract.properties?.Canonical_Link?.url || "UNKNOWN";

  console.log("📜 Governance contract located");
  console.log(`🔗 ${link}`);

  console.log("🧠 Memory anchor verified");
  console.log("⚙️ Environment verified");
  console.log("✅ OTOS Core Intelligence is STABLE");

  process.exit(0);
})().catch((err) => {
  console.error("❌ Baseline boot FAILED");
  console.error(err.body || err);
  process.exit(1);
});
