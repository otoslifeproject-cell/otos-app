/* =========================================================
   OTOS — ANDY ENGINE v5.0
   SYSTEM STABILITY LOCK + VERSION MARKER
   Purpose: Freeze working state, mark Andy LIVE baseline
   Location: otos-app/docs/andy-baseline-lock.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

  /* ---------- VERSION ---------- */
  const BASELINE = {
    engine: "Andy",
    version: "v5.0",
    status: "LIVE",
    lockedAt: new Date().toISOString()
  };

  /* ---------- LOCK ---------- */
  localStorage.setItem("OTOS_ANDY_BASELINE", JSON.stringify(BASELINE));
  localStorage.setItem("OTOS_SYSTEM_LOCK", "ENFORCED");

  /* ---------- SIGNAL ---------- */
  const report = Array.from(document.querySelectorAll(".card"))
    .find(c => c.textContent.includes("Highlight"));
  if (report) {
    const line = document.createElement("div");
    line.textContent = `🔒 Andy baseline locked (${BASELINE.version})`;
    report.appendChild(line);
  }

})();
