/**
 * FEEDER SCHEMA VALIDATOR
 * Hard-fails if required properties are missing
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const FEEDER_DB = process.env.INTAKE_FEEDER_DB;

const REQUIRED = [
  "Title",
  "Raw_Input",
  "Source_Type",
  "Processing_State",
  "Canonical_Artefact",
  "Agent"
];

async function run() {
  const db = await notion.databases.retrieve({ database_id: FEEDER_DB });
  const props = Object.keys(db.properties);

  for (const key of REQUIRED) {
    if (!props.includes(key)) {
      console.error(`❌ MISSING FEEDER PROPERTY: ${key}`);
      process.exit(1);
    }
  }

  console.log("✅ FEEDER SCHEMA VERIFIED");
}

run();
