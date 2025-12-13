// FILE: feeder.js (FULL REPLACEMENT)

import crypto from "crypto";
import { notion } from "./notion-client.js";
import { DB } from "./notion.config.js";

function hashContent(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function ingest(payload) {
  if (!payload || !payload.content) {
    throw new Error("Invalid payload: missing content");
  }

  const contentHash = hashContent(payload.content);

  const record = {
    parent: { database_id: DB.INTAKE_FEEDER },
    properties: {
      Content: { rich_text: [{ text: { content: payload.content } }] },
      Hash: { rich_text: [{ text: { content: contentHash } }] },
      Source: { select: { name: payload.source || "manual" } },
      Status: { select: { name: "ingested" } }
    }
  };

  await notion.pages.create(record);
  return { ok: true, hash: contentHash };
}
