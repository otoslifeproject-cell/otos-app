/**
 * DAILY COMMAND GUARD
 * Blocks any non-approved command in day-to-day mode
 */

import { DAILY_COMMANDS } from "./daily_commands.js";

const cmd = process.argv[2];

if (!DAILY_COMMANDS.includes(cmd)) {
  console.error("❌ COMMAND NOT PERMITTED IN DAILY MODE:", cmd);
  process.exit(1);
}

console.log("🟢 DAILY COMMAND PERMITTED:", cmd);
