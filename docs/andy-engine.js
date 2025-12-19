/* =========================================================
   OTOS — ANDY ENGINE v2.5
   EYE HANDOVER + SYSTEM STATUS BEACON
   Scope: Finalise Andy LIVE → signal EYE21 Parent takeover
   Behaviour only. No UI / CSS changes.
   ========================================================= */

(() => {

  /* ---------- STATE ---------- */
  const STATE = {
    engine: "Andy v2.5",
    timestamp: new Date().toISOString(),
    ready: {
      ingest: false,
      classify: false,
      actions: false,
      projects: false,
      notionWrite: false,
      liveConsent: false
    }
  };

  /* ---------- HELPERS ---------- */
  const exists = (k) => localStorage.getItem(k) !== null;

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

  /* ---------- READINESS CHECKS ---------- */
  STATE.ready.ingest        = exists("OTOS_STAGED_DOCS");
  STATE.ready.classify     = exists("OTOS_CLASSIFIED_DOCS");
  STATE.ready.actions      = exists("OTOS_ACTIONS");
  STATE.ready.projects     = exists("OTOS_PROJECTS");
  STATE.ready.notionWrite  = exists("OTOS_NOTION_WRITE_STATUS");
  STATE.ready.liveConsent  = exists("OTOS_LIVE_CONSENT");

  Object.entries(STATE.ready).forEach(([k, v]) => {
    highlight(`Ready check ${k}: ${v ? "OK" : "PENDING"}`);
  });

  /* ---------- FINAL DECISION ---------- */
  const allGreen = Object.values(STATE.ready).every(Boolean);

  if (allGreen) {
    localStorage.setItem("OTOS_ANDY_STATUS", "LIVE");
    localStorage.setItem("OTOS_EYE21_HANDOVER", "READY");

    highlight("ANDY STATUS: LIVE");
    highlight("EYE21 HANDOVER: AUTHORISED");
    highlight("Parent Node may assume full control");
  } else {
    localStorage.setItem("OTOS_ANDY_STATUS", "PARTIAL");
    highlight("ANDY STATUS: PARTIAL — awaiting completion");
  }

  /* ---------- BEACON ---------- */
  localStorage.setItem(
    "OTOS_SYSTEM_BEACON",
    JSON.stringify({
      engine: STATE.engine,
      status: localStorage.getItem("OTOS_ANDY_STATUS"),
      ready: STATE.ready,
      at: STATE.timestamp
    }, null, 2)
  );

})();
