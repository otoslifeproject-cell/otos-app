/**
 * FEEDER INGEST INITIALISER
 * Creates baseline intake record with guaranteed schema
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const FEEDER_DB = process.env.INTAKE_FEEDER_DB;

const input = process.argv.slice(2).join(" ") || "EMPTY_INGEST";

async function run() {
  await notion.pages.create({
    parent: { database_id: FEEDER_DB },
    properties: {
      Title: {
        title: [{ text: { content: input.slice(0, 80) } }]
      },
      Raw_Input: {
        rich_text: [{ text: { content: input } }]
      },
      Source_Type: {
        select: { name: "Manual" }
      },
      Processing_State: {
        select: { name: "Received" }
      },
      Canonical_Artefact: {
        select: { name: "Not created" }
      },
      Agent: {
        select: { name: "ANDY" }
      }
    }
  });

  console.log("📥 FEEDER INGEST CREATED");
}

run();
