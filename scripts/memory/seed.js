/* eslint-disable no-console */

function nowIso() {
  return new Date().toISOString();
}

function richText(value) {
  if (!value) return [];
  return [{ type: "text", text: { content: String(value) } }];
}

function title(value) {
  return [{ type: "text", text: { content: String(value) } }];
}

async function findPageByTitle(notion, databaseId, titleText) {
  const res = await notion.databases.query({
    database_id: databaseId,
    page_size: 5,
    filter: {
      property: "Name",
      title: { equals: titleText },
    },
  });
  return res.results?.[0] || null;
}

async function upsertSystemCoreRecord(notion, systemCoreDbId, name, fields) {
  const existing = await findPageByTitle(notion, systemCoreDbId, name);

  const props = {
    Name: { title: title(name) },
    Category: fields.Category ? { select: { name: fields.Category } } : undefined,
    Key: fields.Key ? { rich_text: richText(fields.Key) } : undefined,
    Value: fields.Value ? { rich_text: richText(fields.Value) } : undefined,
    Version: fields.Version ? { rich_text: richText(fields.Version) } : undefined,
    Status: fields.Status ? { select: { name: fields.Status } } : undefined,
    Updated_At: { date: { start: nowIso() } },
    Notes: fields.Notes ? { rich_text: richText(fields.Notes) } : undefined,
  };

  // Remove undefined properties
  for (const k of Object.keys(props)) {
    if (props[k] === undefined) delete props[k];
  }

  if (existing) {
    await notion.pages.update({
      page_id: existing.id,
      properties: props,
    });
    return { action: "updated", page_id: existing.id };
  }

  const created = await notion.pages.create({
    parent: { database_id: systemCoreDbId },
    properties: props,
  });
  return { action: "created", page_id: created.id };
}

async function seedKernel(notion, env) {
  const seedResults = [];

  seedResults.push(
    await upsertSystemCoreRecord(notion, env.NOTION_SYSTEM_CORE_DB_ID, "OTOS_KERNEL_IDENTITY", {
      Category: "Identity",
      Key: "system.identity",
      Value:
        "OTOS Internal OS — Parent Node memory + rules live in Notion. This DB is the canonical source of truth for boot + stability.",
      Version: "v1.0",
      Status: "Active",
      Notes: "Boot-seeded by otos_boot workflow.",
    })
  );

  seedResults.push(
    await upsertSystemCoreRecord(notion, env.NOTION_SYSTEM_CORE_DB_ID, "OTOS_KERNEL_RULES_LOCK", {
      Category: "Rules",
      Key: "system.rules.lock",
      Value:
        "Stability-first. No drift. No re-framing without AUTHORISE. Use Notion DBs as canonical memory. Always export snapshots via GitHub Actions.",
      Version: "v1.0",
      Status: "Active",
      Notes: "Boot-seeded by otos_boot workflow.",
    })
  );

  seedResults.push(
    await upsertSystemCoreRecord(notion, env.NOTION_SYSTEM_CORE_DB_ID, "OTOS_KERNEL_BOOTSTRAPPED", {
      Category: "Config",
      Key: "system.bootstrapped",
      Value: "true",
      Version: "v1.0",
      Status: "Active",
      Notes: "Set true when schemas + seed complete.",
    })
  );

  return seedResults;
}

module.exports = {
  seedKernel,
};
