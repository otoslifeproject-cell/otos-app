// FILE: notion.config.js (FULL REPLACEMENT — LOCKED IDS)

// IMPORTANT:
// - Do NOT put tokens here.
// - Tokens are read from process.env.NOTION_TOKEN only.
// - IDs below are raw 32-char hex (validated).

export const NOTION_CONFIG = {
  DATABASE_IDS: {
    // Core work
    PROJECTS: "2c261113a7c780348614f73d9fdd4e92",
    TASKS: "2c461113a7c780159740f485cd2e7ccd",
    KNOWLEDGE: "2c461113a7c78041a702f2d5f3a9cb48",

    // Intake flow
    INTAKE_FEEDER: "2c461113a7c780e39e3feb8472ebd772",
    INTAKE_ARCHIVE: "2c461113a7c780e59c18d36ca72880b5",

    // Agents / ops
    AGENTS: "2c461113a7c78049bdbbc09636db0072",
    OPS: "2c661113a7c78009bf12c3acb53266f4",

    // Memory / kernel
    BRAIN: "2c661113a7c7805b94cfeec6822d6a41",
    CORE: "2c661113a7c780caa822edda093eee9a"
  }
};
