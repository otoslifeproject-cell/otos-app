// ESM bootstrap guard – hard fail if misconfigured
if (!process.env.NOTION_TOKEN) {
  throw new Error("❌ NOTION_TOKEN missing");
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error("❌ OPENAI_API_KEY missing");
}

export const ENV = {
  NOTION_TOKEN: process.env.NOTION_TOKEN,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  BRAIN_DB: process.env.BRAIN_DB,
  CORE_DB: process.env.CORE_DB,
  OPS_DB: process.env.OPS_DB,

  OTOS_AGENTS_DB: process.env.OTOS_AGENTS_DB,
  OTOS_INTAKE_FEEDER_DB: process.env.OTOS_INTAKE_FEEDER_DB,
  OTOS_FEEDER_INTAKE_ARCHIVE_DB: process.env.OTOS_FEEDER_INTAKE_ARCHIVE_DB,
  OTOS_KNOWLEDGE_DB: process.env.OTOS_KNOWLEDGE_DB,
  OTOS_IDEAS_DB: process.env.OTOS_IDEAS_DB,
  NOTION_PROJECTS_DB_ID: process.env.NOTION_PROJECTS_DB_ID,
  NOTION_TASKS_DB_ID: process.env.NOTION_TASKS_DB_ID,
};
