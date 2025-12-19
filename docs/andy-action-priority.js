/* =========================================================
   OTOS — ANDY ENGINE v3.4
   ACTION PRIORITISER (SCORE → TOP ACTION)
   Purpose: Select and surface the single highest-impact action
   Location: otos-app/docs/andy-action-priority.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

  /* ---------- STATE ---------- */
  const actions = JSON.parse(localStorage.getItem("OTOS_ACTIONS") || "[]");

  /* ---------- HELPERS ---------- */
  const highlight = (msg) => {
    const report = Array.from(document.querySelectorAll(".card"))
      .find(c => c.textContent.includes("Highlight"));
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  if (!actions.length) {
    highlight("No actions to prioritise");
    return;
  }

  /* ---------- PRIORITISE ---------- */
  actions.sort((a, b) => b.score - a.score || new Date(a.createdAt) - new Date(b.createdAt));

  const top = actions[0];
  localStorage.setItem("OTOS_TOP_ACTION", JSON.stringify(top));

  highlight(`🔥 Top Action set: ${top.title} (score ${top.score})`);

  /* ---------- COMMIT ---------- */
  localStorage.setItem("OTOS_ACTIONS", JSON.stringify(actions));

})();
