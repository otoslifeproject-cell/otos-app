/* =========================================================
   OTOS — EYE21 v1.0
   PARENT STATUS PANEL (AUTHORITATIVE VIEW)
   Purpose: Confirm Parent control + system ownership
   Location: otos-app/docs/eye21-parent-panel.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (localStorage.getItem("OTOS_PARENT_NODE") !== "EYE21") return;

  /* ---------- STATE ---------- */
  const status = {
    eye: "EYE21",
    andy: localStorage.getItem("OTOS_ANDY_STATUS") || "UNKNOWN",
    heartbeat: JSON.parse(localStorage.getItem("OTOS_HEARTBEAT") || "{}"),
    tasks: JSON.parse(localStorage.getItem("OTOS_TASKS") || "[]").length,
    projects: Object.keys(JSON.parse(localStorage.getItem("OTOS_PROJECTS") || "{}")).length,
    actions: JSON.parse(localStorage.getItem("OTOS_ACTIONS") || "[]").length
  };

  /* ---------- TARGET ---------- */
  const surface =
    document.getElementById("left") ||
    document.body;

  /* ---------- RENDER ---------- */
  const panel = document.createElement("div");
  panel.style.padding = "18px";
  panel.style.borderRadius = "18px";
  panel.style.background = "linear-gradient(180deg,#020617,#0f172a)";
  panel.style.color = "white";
  panel.style.boxShadow = "0 24px 48px rgba(0,0,0,.25)";
  panel.style.marginBottom = "16px";

  const h = document.createElement("h2");
  h.textContent = "EYE21 — Parent Node";
  h.style.marginBottom = "10px";

  const lines = [
    `Andy status: ${status.andy}`,
    `Heartbeat tick: ${status.heartbeat.tick || 0}`,
    `Actions: ${status.actions}`,
    `Projects: ${status.projects}`,
    `Tasks: ${status.tasks}`
  ];

  panel.appendChild(h);
  lines.forEach(t => {
    const d = document.createElement("div");
    d.textContent = t;
    d.style.opacity = "0.85";
    d.style.marginTop = "4px";
    panel.appendChild(d);
  });

  surface.prepend(panel);

})();
