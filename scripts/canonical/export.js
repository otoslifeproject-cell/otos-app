/**
 * CANONICAL EXPORT
 * Pulls full document content and writes immutable export file
 */

import fs from "fs";
import path from "path";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const DOCUMENTS_DB = process.env.CANONICAL_DOCS_DB;
const EXPORT_ROOT = "documents/_exports";

async function run() {
  const docs = await notion.databases.query({
    database_id: DOCUMENTS_DB,
    filter: {
      property: "Canonical_Artefact",
      select: { equals: "Canonical (Locked)" }
    }
  });

  for (const page of docs.results) {
    const title =
      page.properties.Title.title[0]?.plain_text || "Untitled";

    const version =
      page.properties.Version.rich_text[0]?.plain_text || "v0";

    const blocks = await notion.blocks.children.list({
      block_id: page.id
    });

    let content = `# ${title}\n\n`;

    for (const block of blocks.results) {
      if (block.type === "paragraph") {
        const text =
          block.paragraph.rich_text.map(t => t.plain_text).join("");
        content += text + "\n\n";
      }
    }

    const safeTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const filePath = path.join(
      EXPORT_ROOT,
      `${safeTitle}_${version}.md`
    );

    fs.mkdirSync(EXPORT_ROOT, { recursive: true });
    fs.writeFileSync(filePath, content, "utf8");

    await notion.pages.update({
      page_id: page.id,
      properties: {
        Export_Path: {
          rich_text: [{ text: { content: filePath } }]
        }
      }
    });

    console.log(`📦 EXPORTED: ${filePath}`);
  }
}

run();
