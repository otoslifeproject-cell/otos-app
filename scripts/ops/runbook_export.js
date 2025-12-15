/**
 * DAY-ONE RUNBOOK EXPORT
 * Produces minimal ops instructions for human use
 */

import fs from "fs";

const content = `
# OTOS Daily Runbook

Allowed actions:
- FEEDER_INGEST
- SNAPSHOT_MEMORY
- EXPORT_CANONICAL_DOC
- RUN_HEARTBEAT

Rules:
- No schema changes
- No agent boundary changes
- No memory unfreeze

All changes are logged.
`;

fs.mkdirSync("ops", { recursive: true });
fs.writeFileSync("ops/DAY_ONE_RUNBOOK.md", content);

console.log("📗 DAY-ONE RUNBOOK WRITTEN");
