/* =========================================================
   OTOS — ANDY ENGINE v2.8
   DOC → NOTION QUEUE MONITOR (READ-ONLY)
   Scope: Visualise pipeline state + backlog
   Rule: Append-only, no layout mutation
   Location: otos-app/docs/andy-queue-monitor.js
   ========================================================= */

(() => {

  /* ---------- STATE ---------- */
  const STATE = {
    engine: "Andy v2.8",
    intervalMs: 1500,
    lastRendered: 0
  };

  /* ---------- HELPERS ---------- */
  const cardByTitle = (title) =>
    Array.from(document.querySelectorAll(".card"))
      .find(c => c.querySelector("h3")?.textContent.trim() === title);

  const report = cardByTitle("Running Highlight Report");
  if (!report) return;

  const getQueueState = () => ({
    staged: JSON.parse(localStorage.getItem("OTOS_STAGED_DOCS") || "[]").length,
    classified: JSON.parse(localStorage.getItem("OTOS_CLASSIFIED_DOCS") || "{}"),
    actions: JSON.parse(localStorage.getItem("OTOS_ACTIONS") || "[]").length,
    projects: JSON.parse(localStorage.getItem("OTOS_PROJECTS") || "{}"),
    live: localStorage.getItem("OTOS_ANDY_STATUS") === "LIVE"
  });

  const render = () => {
    const now = Date.now();
    if (now - STATE.lastRendered < STATE.intervalMs) return;
    STATE.lastRendered = now;

    const q = getQueueState();

    const line = document.createElement("div");
    line.textContent =
      `• Queue → staged:${q.staged} ` +
      `actions:${q.actions} ` +
      `projects:${Object.keys(q.projects).length} ` +
      `status:${q.live ? "LIVE" : "IDLE"}`;

    report.appendChild(line);

    if (report.children.length > 14) {
      report.removeChild(report.firstChild);
    }
  };

  /* ---------- LOOP ---------- */
  setInterval(render, STATE.intervalMs);

  /* ---------- BOOT ---------- */
  localStorage.setItem("OTOS_ANDY_QUEUE_MONITOR", "ACTIVE");
  render();

})();
