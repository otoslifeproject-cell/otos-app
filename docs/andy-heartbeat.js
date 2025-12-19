/* =========================================================
   OTOS — ANDY ENGINE v4.2
   SYSTEM HEARTBEAT + LIVE STATUS PANEL
   Purpose: Prove system is alive, advancing, and owned by EYE21
   Location: otos-app/docs/andy-heartbeat.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

  /* ---------- STATE ---------- */
  const STATE = {
    tick: 0,
    last: Date.now()
  };

  /* ---------- HELPERS ---------- */
  const cardByTitle = (title) =>
    Array.from(document.querySelectorAll(".card"))
      .find(c => c.textContent.includes(title));

  const highlight = (msg) => {
    const report = cardByTitle("Highlight");
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  /* ---------- HEARTBEAT ---------- */
  setInterval(() => {
    STATE.tick += 1;
    STATE.last = Date.now();

    localStorage.setItem(
      "OTOS_HEARTBEAT",
      JSON.stringify({
        tick: STATE.tick,
        at: new Date().toISOString(),
        eye: localStorage.getItem("OTOS_PARENT_NODE") || "UNSET"
      })
    );

    if (STATE.tick % 5 === 0) {
      highlight(`💓 Andy heartbeat ${STATE.tick}`);
    }
  }, 2000);

  /* ---------- BOOT ---------- */
  highlight("💓 Andy heartbeat started");

})();
