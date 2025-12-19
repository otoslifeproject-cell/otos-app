/* =========================================================
   OTOS — ANDY ENGINE v4.3
   COMMAND → INTAKE WIRING (PALETTE → INGEST)
   Purpose: Route keyboard commands (A/G/R/C/T) into Intake
   Location: otos-app/docs/andy-command-router.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

  /* ---------- STATE ---------- */
  let activeCommand = localStorage.getItem("OTOS_LAST_COMMAND") || "A";

  /* ---------- HELPERS ---------- */
  const highlight = (msg) => {
    const report = Array.from(document.querySelectorAll(".card"))
      .find(c => c.textContent.includes("Highlight"));
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  /* ---------- COMMAND LISTENER ---------- */
  window.addEventListener("storage", (e) => {
    if (e.key === "OTOS_LAST_COMMAND" && e.newValue) {
      activeCommand = e.newValue;
      highlight(`⌨️ Active command set: ${activeCommand}`);
    }
  });

  /* ---------- INTAKE HOOK ---------- */
  if (typeof window.OTOS_INGEST !== "function") {
    highlight("⚠️ Intake not available for command routing");
    return;
  }

  // Wrap ingest to inject active command
  const originalIngest = window.OTOS_INGEST;
  window.OTOS_INGEST = (files, cmd) => {
    const useCmd = cmd || activeCommand || "A";
    highlight(`➡️ Routing ingest with command: ${useCmd}`);
    return originalIngest(files, useCmd);
  };

  highlight("Command router LIVE");

})();
