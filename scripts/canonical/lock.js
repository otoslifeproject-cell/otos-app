/**
 * CANONICAL LOCK GATE
 * Enforces that a document cannot be marked Canonical unless all conditions are met.
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const DOCUMENTS_DB = process.env.CANONICAL_DOCS_DB;

const REQUIRED_SELECT = ["Document_Type", "Status", "Canonical_Artefact"];
const REQUIRED_CHECKBOX = ["Fact_Checked"];
const REQUIRED_TEXT = ["Version", "Export_Path"];
const REQUIRED_MULTI = ["Approved_By"];

async function run() {
  const docs = await notion.databases.query({
    database_id: DOCUMENTS_DB,
    filter: {
      property: "Canonical_Artefact",
      select: { equals: "Draft" }
    }
  });

  for (const page of docs.results) {
    const props = page.properties;

    const fail = [];

    for (const key of REQUIRED_SELECT) {
      if (!props[key]?.select?.name) fail.push(key);
    }

    for (const key of REQUIRED_CHECKBOX) {
      if (!props[key]?.checkbox) fail.push(key);
    }

    for (const key of REQUIRED_TEXT) {
      if (!props[key]?.rich_text?.[0]?.plain_text) fail.push(key);
    }

    for (const key of REQUIRED_MULTI) {
      if (!props[key]?.multi_select?.length) fail.push(key);
    }

    if (fail.length) {
      console.error(`❌ BLOCKED: ${page.id}`);
      console.error(`Missing: ${fail.join(", ")}`);
      process.exit(1);
    }

    await notion.pages.update({
      page_id: page.id,
      properties: {
        Canonical_Artefact: {
          select: { name: "Canonical (Locked)" }
        },
        Status: {
          select: { name: "Canonical" }
        },
        Locked_At: {
          date: { start: new Date().toISOString() }
        }
      }
    });

    console.log(`🔒 LOCKED: ${page.id}`);
  }
}

run();
