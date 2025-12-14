/**
 * UI COMMAND REGISTRY
 * Canonical list of allowed post-live commands
 * UI may only invoke commands declared here
 */

export const COMMANDS = {
  SNAPSHOT_MEMORY: {
    id: "SNAPSHOT_MEMORY",
    description: "Create immutable memory snapshot",
    script: "scripts/memory/snapshot.js",
    role: "Core"
  },
  EXPORT_CANONICAL_DOC: {
    id: "EXPORT_CANONICAL_DOC",
    description: "Export locked canonical document",
    script: "scripts/docs/export_canonical.js",
    role: "Core"
  },
  RUN_HEARTBEAT: {
    id: "RUN_HEARTBEAT",
    description: "Emit system heartbeat",
    script: "scripts/system/heartbeat.js",
    role: "Core"
  },
  FEEDER_INGEST: {
    id: "FEEDER_INGEST",
    description: "Create feeder ingest",
    script: "scripts/feeder/init.js",
    role: "Child"
  }
};
