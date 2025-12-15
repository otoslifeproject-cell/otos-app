/* eslint-disable no-console */

/**
 * Idempotent DB schema enforcement:
 * - Retrieves current database properties
 * - Adds any missing properties via database update
 * - Never deletes or changes existing property types (safety)
 */

function propTitle() {
  return { title: {} };
}

function propRichText() {
  return { rich_text: {} };
}

function propSelect(options) {
  return {
    select: {
      options: options.map((name) => ({ name })),
    },
  };
}

function propMultiSelect(options) {
  return {
    multi_select: {
      options: options.map((name) => ({ name })),
    },
  };
}

function propDate() {
  return { date: {} };
}

function propNumber(format = "number") {
  return { number: { format } };
}

function propCheckbox() {
  return { checkbox: {} };
}

function propUrl() {
  return { url: {} };
}

function propRelation(database_id) {
  return { relation: { database_id } };
}

function propPeople() {
  return { people: {} };
}

function propEmail() {
  return { email: {} };
}

function propPhone() {
  return { phone_number: {} };
}

function propStatus(options) {
  // Notion "status" property type exists, but is not always enabled in every workspace.
  // We use select for maximum compatibility.
  return propSelect(options);
}

function buildSchemas(env) {
  const schemas = {};

  // ===== OTOS BRAIN DB =====
  schemas.BRAIN = {
    requiredTitleName: "Name",
    properties: {
      Name: propTitle(),
      Type: propSelect([
        "Insight",
        "Rule",
        "Decision",
        "Plan",
        "Spec",
        "Note",
        "Meeting",
        "Reference",
        "Prompt",
        "Other",
      ]),
      Source: propSelect([
        "Feeder",
        "ChatGPT",
        "Manual",
        "Email",
        "Web",
        "Doc",
        "Audio",
        "YouTube",
        "Other",
      ]),
      Status: propStatus(["Todo", "Processing", "Ready", "Blocked", "Archived"]),
      Priority: propSelect(["Low", "Medium", "High", "Critical"]),
      Tags: propMultiSelect([
        "Kernel",
        "NHS",
        "UI",
        "Feeder",
        "Andy",
        "Systems",
        "Ops",
        "Research",
        "Pitch",
        "Compliance",
      ]),
      Content: propRichText(),
      Summary: propRichText(),
      "AI Notes": propRichText(),
      Keywords: propMultiSelect([]),
      UUID: propRichText(),
      Created_At: propDate(),
      Updated_At: propDate(),
      Link: propUrl(),
    },
  };

  // Optional relations if IDs provided
  if (env.NOTION_PROJECTS_DB_ID) {
    schemas.BRAIN.properties["Project"] = propRelation(env.NOTION_PROJECTS_DB_ID);
  }
  if (env.NOTION_TASKS_DB_ID) {
    schemas.BRAIN.properties["Task"] = propRelation(env.NOTION_TASKS_DB_ID);
  }

  // ===== OTOS SYSTEM CORE DB =====
  schemas.SYSTEM_CORE = {
    requiredTitleName: "Name",
    properties: {
      Name: propTitle(),
      Category: propSelect(["Kernel", "Config", "Rules", "Identity", "Ops", "Other"]),
      Key: propRichText(),
      Value: propRichText(),
      Version: propRichText(),
      Status: propStatus(["Active", "Deprecated", "Draft"]),
      Updated_At: propDate(),
      Owner: propPeople(),
      Notes: propRichText(),
    },
  };

  // ===== OTOS OPERATIONS DB =====
  schemas.OPERATIONS = {
    requiredTitleName: "Name",
    properties: {
      Name: propTitle(),
      Area: propSelect([
        "Boot",
        "Deploy",
        "Data",
        "Notion",
        "GitHub",
        "UI",
        "Feeder",
        "NHS",
        "Other",
      ]),
      Status: propStatus(["Todo", "Doing", "Done", "Blocked"]),
      Priority: propSelect(["Low", "Medium", "High", "Critical"]),
      Owner: propPeople(),
      Due: propDate(),
      Notes: propRichText(),
      Evidence: propUrl(),
      Updated_At: propDate(),
    },
  };

  return schemas;
}

async function ensureDatabaseHasProperties(notion, databaseId, schemaSpec) {
  const db = await notion.databases.retrieve({ database_id: databaseId });

  const existing = db.properties || {};
  const desired = schemaSpec.properties || {};

  // Ensure title exists (Notion always has one, but name may differ)
  // We will only add properties; we won't rename existing title.
  const missing = {};
  for (const [name, spec] of Object.entries(desired)) {
    if (!existing[name]) missing[name] = spec;
  }

  const patch = {};
  if (Object.keys(missing).length > 0) {
    patch.properties = missing;
    await notion.databases.update({
      database_id: databaseId,
      ...patch,
    });
  }

  return {
    databaseId,
    title: db.title?.map((t) => t.plain_text).join("") || "",
    added: Object.keys(missing),
    existingCount: Object.keys(existing).length,
    desiredCount: Object.keys(desired).length,
  };
}

module.exports = {
  buildSchemas,
  ensureDatabaseHasProperties,
};
