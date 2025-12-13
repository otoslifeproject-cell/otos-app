/**
 * OTOS Memory Seeder
 * GitHub-safe, feeder-based, idempotent
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const BRAIN_DB = process.env.BRAIN_DB;
const CORE_DB = process.env.CORE_DB;

if (!BRAIN_DB || !CORE_DB) {
  console.error("Missing required DB environment variables");
  process.exit(1);
}

const FEEDER_DIR = "./feeder";

function hash(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function alreadyExists(dbId, contentHash) {
  const res = await notion.databases.query({
    database_id: dbId,
    filter: {
      property: "hash",
      rich_text: {
        equals: contentHash,
      },
    },
  });
  return res.results.length > 0;
}

async function writePage(dbId, title, body, contentHash) {
  await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      Name: {
        title: [{ text: { content: title } }],
      },
      hash: {
        rich_text: [{ text: { content: contentHash } }],
      },
    },
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ text: { content: body } }],
        },
      },
    ],
  });
}

async function run() {
  console.log("Memory seeder starting");

  if (!fs.existsSync(FEEDER_DIR)) {
    console.log("No feeder directory found — nothing to seed");
    return;
  }

  const files = fs.readdirSync(FEEDER_DIR).filter(f => f.endsWith(".json"));

  if (files.length === 0) {
    console.log("Feeder empty — nothing to seed");
    return;
  }

  for (const file of files) {
    const fullPath = path.join(FEEDER_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const contentHash = hash(raw);

    let targetDb = BRAIN_DB;
    let title = file;

    if (file.toLowerCase().includes("core")) {
      targetDb = CORE_DB;
    }

    const exists = await alreadyExists(targetDb, contentHash);
    if (exists) {
      console.log(`Skipping duplicate: ${file}`);
      continue;
    }

    await writePage(targetDb, title, raw, contentHash);
    console.log(`Seeded: ${file}`);
  }

  console.log("Memory seeder complete");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
