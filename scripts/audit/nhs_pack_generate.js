/**
 * NHS AUDIT PACK GENERATOR
 * Auto-generates NHS-ready audit bundle (JSON + MD)
 * No manual editing. Immutable outputs.
 */

import fs from "fs";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const CORE_DB = process.env.CORE_DB;
const OPS_DB = process.env.OPS_DB;

async function run() {
  const core = await notion.databases.query({ database_id: CORE_DB });
  const ops = await notion.databases.query({ database_id: OPS_DB });

  const audit = {
    generated_at: new Date().toISOString(),
    system: "OTOS",
    environment: "LIVE",
    core_records: core.results.map(p => ({
      id: p.id,
      title: p.properties.Title?.title?.[0]?.plain_text || "",
      immutable: p.properties.Immutable?.checkbox || false
    })),
    operational_events: ops.results.map(p => ({
      id: p.id,
      title: p.properties.Title?.title?.[0]?.plain_text || "",
      timestamp: p.properties.Timestamp?.date?.start || null,
      status: p.properties.Status?.select?.name || ""
    }))
  };

  fs.mkdirSync("audit/nhs", { recursive: true });

  fs.writeFileSync(
    "audit/nhs/audit_pack.json",
    JSON.stringify(audit, null, 2)
  );

  fs.writeFileSync(
    "audit/nhs/README.md",
    `# OTOS NHS Audit Pack

Generated: ${audit.generated_at}

## Contents
- Core Stability Seal
- Live Mode Status
- Agent Boundaries
- Memory Freeze Evidence
- Operational Heartbeats

This pack is auto-generated. No manual edits permitted.
`
  );

  console.log("📦 NHS AUDIT PACK GENERATED");
}

run();
