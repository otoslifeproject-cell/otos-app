/**
 * UI COMMAND EXECUTOR
 * Executes only registered commands with role enforcement
 */

import { COMMANDS } from "./registry.js";
import { execSync } from "child_process";

const commandId = process.argv[2];
const role = process.argv[3] || "Core";
const payload = process.argv.slice(4).join(" ");

if (!COMMANDS[commandId]) {
  console.error("❌ UNKNOWN COMMAND");
  process.exit(1);
}

const cmd = COMMANDS[commandId];

if (cmd.role !== role && role !== "Core") {
  console.error("❌ ROLE NOT PERMITTED");
  process.exit(1);
}

const run = `node ${cmd.script} ${payload}`;
execSync(run, { stdio: "inherit" });

console.log("🎛️ COMMAND EXECUTED:", commandId);
