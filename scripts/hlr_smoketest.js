// FILE: scripts/hlr_smoketest.js
import { writeHLR } from "./hlr_writer.js";

await writeHLR({
  source: "Cockpit",
  actor: "System",
  action: "HLR_SMOKETEST",
  severity: "SYSTEM",
  payload: {
    status: "GO",
    note: "HLR live and accepting writes"
  }
});

console.log("HLR smoketest complete");
