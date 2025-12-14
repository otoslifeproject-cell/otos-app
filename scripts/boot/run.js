/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const { createNotionClient, requireEnv, optionalEnv } = require("../notion/client");
const { buildSchemas, ensureDatabaseHasProperties } = require("./schema");
const { seedKernel } = require("./seed");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

async function main() {
  const notion = createNotionClient();

  // REQUIRED DB IDs
  const env = {
    NOTION_BRAIN_DB_ID: requireEnv("NOTION_BRAIN_DB_ID"),
    NOTION_SYSTEM_CORE_DB_ID: requireEnv("NOTION_SYSTEM_CORE_DB_ID"),
    NOTION_OPERATIONS_DB_ID: requireEnv("NOTION_OPERATIONS_DB_ID"),

    // OPTIONAL
    NOTION_PROJECTS_DB_ID: optionalEnv("NOTION_PROJECTS_DB_ID"),
    NOTION_TASKS_DB_ID: optionalEnv("NOTION_TASKS_DB_ID"),
    NOTION_FEEDER_INTAKE_DB_ID: optionalEnv("NOTION_FEEDER_INTAKE_DB_ID"),
  };

  const schemas = buildSchemas(env);

  const results = {
    ts: new Date().toISOString(),
    env: {
      NOTION_BRAIN_DB_ID: "***",
      NOTION_SYSTEM_CORE_DB_ID: "***",
      NOTION_OPERATIONS_DB_ID: "***",
      NOTION_PROJECTS_DB_ID: env.NOTION_PROJECTS_DB_ID ? "***" : null,
      NOTION_TASKS_DB_ID: env.NOTION_TASKS_DB_ID ? "***" : null,
      NOTION_FEEDER_INTAKE_DB_ID: env.NOTION_FEEDER_INTAKE_DB_ID ? "***" : null,
    },
    databases: [],
    seed: [],
  };

  console.log("🧠 OTOS BOOT — starting");

  // Enforce schemas
  console.log("🔧 Enforcing Notion DB schemas...");
  results.databases.push(
    await ensureDatabaseHasProperties(notion, env.NOTION_BRAIN_DB_ID, schemas.BRAIN)
  );
  results.databases.push(
    await ensureDatabaseHasProperties(notion, env.NOTION_SYSTEM_CORE_DB_ID, schemas.SYSTEM_CORE)
  );
  results.databases.push(
    await ensureDatabaseHasProperties(notion, env.NOTION_OPERATIONS_DB_ID, schemas.OPERATIONS)
  );

  // Seed kernel core records
  console.log("🌱 Seeding System Core...");
  results.seed = await seedKernel(notion, env);

  // Write artifact snapshot
  const outDir = path.join(process.cwd(), "artifacts");
  ensureDir(outDir);
  const outPath = path.join(outDir, "otos-boot-snapshot.json");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf8");

  console.log("✅ OTOS BOOT — complete");
  console.log(`📦 Snapshot: ${outPath}`);
}

main().catch((err) => {
  console.error("❌ OTOS BOOT — failed");
  console.error(err?.stack || err);
  process.exit(1);
});
