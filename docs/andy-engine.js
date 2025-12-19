/* =========================================================
   OTOS — ANDY ENGINE v2.1
   AGENT READINESS + HANDOVER SIGNAL
   Scope: Confirm Andy LIVE + Parent handover to EYE21
   Behaviour only. No UI changes.
   ========================================================= */

(() => {

  /* ---------- STATE ---------- */
  const STATE = {
    engine: "Andy v2.1",
    checks: {
      ingest: false,
      classify: false,
      actions: false,
      projects: false,
      notionReady: false
    }
  };

  /* ---------- HELPERS ---------- */
  const cardByTitle = (title) =>
    Array.from(document.querySelectorAll(".card"))
      .find(c => c.querySelector("h3")?.textContent.trim() === title);

  const highlight = (msg) => {
    const report = cardByTitle("Running Highlight Report");
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  const exists = (key) => localStorage.getItem(key) !== null;

  /* ---------- CHECKS ---------- */
  STATE.checks.ingest        = exists("OTOS_STAGED_DOCS");
  STATE.checks.classify     = exists("OTOS_CLASSIFIED_DOCS");
  STATE.checks.actions      = exists("OTOS_ACTIONS");
  STATE.checks.projects     = exists("OTOS_PROJECTS");
  STATE.checks.notionReady  = exists("OTOS_NOTION_PUSH_READY");

  Object.entries(STATE.checks).forEach(([k, v]) => {
    highlight(`Check ${k}: ${v ? "OK" : "MISSING"}`);
  });

  /* ---------- READY LOGIC ---------- */
  const allGreen = Object.values(STATE.checks).every(Boolean);

  if (allGreen) {
    highlight("ANDY STATUS: LIVE + STABLE");
    highlight("Parent handover authorised → EYE21");
    localStorage.setItem("OTOS_ANDY_LIVE", "true");
    localStorage.setItem("OTOS_EYE21_READY", "true");
  } else {
    highlight("ANDY STATUS: PARTIAL — awaiting inputs");
  }

  /* ---------- FINAL ---------- */
  localStorage.setItem(
    "OTOS_ANDY_STATUS",
    JSON.stringify({ engine: STATE.engine, checks: STATE.checks }, null, 2)
  );

})();
