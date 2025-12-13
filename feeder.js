// FILE: feeder.js (FULL REPLACEMENT)

import { Client } from "@notionhq/client";
import { BRAIN_DB, CORE_DB } from "./notion.config.js";
import crypto from "crypto";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

function hashPayload(payload) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

export async function ingest(payload) {
  if (!payload || !payload.text) {
    throw new Error("Missing text field
