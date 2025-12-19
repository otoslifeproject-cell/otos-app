/* =========================================================
   OTOS — ANDY ENGINE v6.3
   PROJECT / TASK VISUAL BOARD
   Purpose: Render Projects → Tasks so you can SEE structure
   Scope: Read-only UI (local state only)
   Location: otos-app/docs/andy-project-board.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (window.OTOS_PROJECT_BOARD_ACTIVE) return;
  window.OTOS_PROJECT_BOARD_ACTIVE = true;

  const PROJ_KEY = "OTOS_PROJECTS";

  const projects = JSON.parse(localStorage.getItem(PROJ_KEY) || "{}");
  if (!Object.keys(projects).length) return;

  /* ---------- HOST ---------- */
  const host =
    document.getElementById("center") ||
    document.getElementById("left") ||
    document.body;

  /* ---------- WRAP ---------- */
  const wrap = document.createElement("div");
  wrap.style.display = "grid";
  wrap.style.gridTemplateColumns = "repeat(auto-fill,minmax(260px,1fr))";
  wrap.style.gap = "16px";
  wrap.style.marginBottom = "20px";

  /* ---------- RENDER ---------- */
  Object.entries(projects).forEach(([name, data]) => {
    const card = document.createElement("div");
    card.style.padding = "16px";
    card.style.borderRadius = "18px";
    card.style.background = "linear-gradient(180deg,#0b1220,#020617)";
    card.style.color = "#e5e7eb";
    card.style.boxShadow = "0 24px 48px rgba(0,0,0,.45)";

    const h = document.createElement("div");
    h.textContent = name;
    h.style.fontWeight = "800";
    h.style.marginBottom = "10px";

    card.appendChild(h);

    (data.tasks || []).forEach(t => {
      const row = document.createElement("div");
      row.textContent = "• " + t.name;
      row.style.fontSize = "12px";
      row.style.opacity = "0.85";
      row.style.marginBottom = "6px";
      card.appendChild(row);
    });

    wrap.appendChild(card);
  });

  host.appendChild(wrap);

})();
