/* =========================================================
   OTOS — ANDY ENGINE v2.9
   INTAKE CONFIRMATION + TIER-0 STAGING (CRITICAL FIX)
   Purpose: Make ingest observable + persistent BEFORE Notion
   Location: otos-app/docs/intake-handler.js
   FULL REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- STATE ---------- */
  const STATE = {
    received: 0,
    queue: JSON.parse(localStorage.getItem("OTOS_STAGED_DOCS") || "[]")
  };

  /* ---------- HELPERS ---------- */
  const qs = (id) => document.getElementById(id);

  const highlight = (msg) => {
    const report = Array.from(document.querySelectorAll(".card"))
      .find(c => c.textContent.includes("Highlight"));
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  const updateStats = () => {
    const stats = qs("stats-queue");
    if (stats) stats.textContent = STATE.queue.length;
  };

  /* ---------- INGEST ---------- */
  window.OTOS_INGEST = (files, command = "A") => {
    if (!files || !files.length) return;

    Array.from(files).forEach(file => {
      const record = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type || "unknown",
        command,
        receivedAt: new Date().toISOString()
      };

      STATE.queue.push(record);
      STATE.received += 1;

      highlight(`📥 File accepted: ${file.name}`);
    });

    localStorage.setItem("OTOS_STAGED_DOCS", JSON.stringify(STATE.queue));
    updateStats();
  };

  /* ---------- BIND UI ---------- */
  const input = qs("intake-files");
  const btn = qs("ingest-btn");
  const cmd = qs("intake-command");

  if (btn && input) {
    btn.onclick = () => {
      window.OTOS_INGEST(input.files, cmd?.value || "A");
      input.value = ""; // clear safely
    };
  }

  /* ---------- BOOT ---------- */
  updateStats();
  highlight("Intake handler LIVE");

})();
