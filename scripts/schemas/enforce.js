import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const DBS = [
  { name: "BRAIN_DB", id: process.env.BRAIN_DB },
  { name: "CORE_DB", id: process.env.CORE_DB },
  { name: "OPS_DB", id: process.env.OPS_DB },
];

const SCHEMAS = {
  BRAIN_DB: {
    Name: { title: {} },
    Text: { rich_text: {} },
    Source: {
      select: {
        options: [
          { name: "manual", color: "blue" },
          { name: "feeder", color: "green" },
          { name: "doc", color: "yellow" },
          { name: "pdf", color: "orange" },
          { name: "meeting", color: "purple" },
          { name: "web", color: "gray" },
          { name: "system", color: "red" },
        ],
      },
    },
    Tags: { multi_select: {} },
    Status: {
      select: {
        options: [
          { name: "new", color: "blue" },
          { name: "embedded", color: "green" },
          { name: "archived", color: "gray" },
        ],
      },
    },
    CreatedAt: { date: {} },
    Embedding: { rich_text: {} },
    EmbeddedAt: { date: {} },
    EmbedModel: { select: {} },
  },

  CORE_DB: {
    Name: { title: {} },
    Type: {
      select: {
        options: [
          { name: "rule", color: "red" },
          { name: "contract", color: "purple" },
          { name: "decision", color: "blue" },
          { name: "golden", color: "yellow" },
          { name: "policy", color: "green" },
          { name: "error_log", color: "gray" },
        ],
      },
    },
    Text: { rich_text: {} },
    Scope: {
      select: {
        options: [
          { name: "global", color: "red" },
          { name: "ui", color: "blue" },
          { name: "feeder", color: "green" },
          { name: "nhs", color: "purple" },
          { name: "governance", color: "yellow" },
          { name: "marketing", color: "orange" },
          { name: "devops", color: "gray" },
        ],
      },
    },
    Status: {
      select: {
        options: [
          { name: "draft", color: "blue" },
          { name: "locked", color: "green" },
          { name: "deprecated", color: "gray" },
        ],
      },
    },
    CreatedAt: { date: {} },
    Version: { rich_text: {} },
  },

  OPS_DB: {
    Name: { title: {} },
    Owner: {
      select: {
        options: [
          { name: "Dean", color: "blue" },
          { name: "AI", color: "purple" },
        ],
      },
    },
    Type: {
      select: {
        options: [
          { name: "task", color: "blue" },
          { name: "run", color: "green" },
          { name: "deploy", color: "purple" },
          { name: "checklist", color: "yellow" },
        ],
      },
    },
    Status: {
      select: {
        options: [
          { name: "todo", color: "gray" },
          { name: "doing", color: "yellow" },
          { name: "blocked", color: "red" },
          { name: "done", color: "green" },
        ],
      },
    },
    Priority: {
      select: {
        options: [
          { name: "p0", color: "red" },
          { name: "p1", color: "orange" },
          { name: "p2", color: "yellow" },
          { name: "p3", color: "gray" },
        ],
      },
    },
    Notes: { rich_text: {} },
    CreatedAt: { date: {} },
    DueAt: { date: {} },
    Link: { url: {} },
  },
};

async function enforce(dbName, dbId) {
  if (!dbId) {
    console.log(`⚠️ ${dbName} not set — skipping`);
    return;
  }

  console.log(`🔒 Enforcing schema on ${dbName}`);

  const schema = SCHEMAS[dbName];
  if (!schema) {
    console.log(`⚠️ No schema defined for ${dbName}`);
    return;
  }

  await notion.databases.update({
    database_id: dbId,
    properties: schema,
  });

  console.log(`✅ ${dbName} schema enforced`);
}

for (const db of DBS) {
  await enforce(db.name, db.id);
}

console.log("🧠 Schema enforcement complete");
