/* =========================================================
   OTOS — ANDY ENGINE v4.9
   ACTIVITY STREAM UI VIEWER
   Purpose: Render live Andy activity log in UI
   Location: otos-app/docs/andy-activity-ui.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

  const KEY = "OTOS_ACTIVITY_STREAM";

  /* ---------- TARGET ---------- */
  const host =
    document.getElementById("right") ||
    document.getElementById("center") ||
    document.body;

  /* ---------- PANEL ---------- */
  const panel = document.createElement("div");
  panel.style.padding = "16px";
  panel.style.borderRadius = "14px";
  panel.style.background = "#020617";
  panel.style.color = "#e5e7eb";
  panel.style.boxShadow = "0 16px 32px rgba(0,0,0,.3)";
  panel.style.marginBottom = "12px";
  panel.style.fontSize = "13px";
  panel.style.maxHeight = "280px";
  panel.style.overflowY = "auto";

  const title = document.createElement("div");
  title.textContent = "Andy · Activity Stream";
  title.style.fontWeight = "600";
  title.style.marginBottom = "8px";
  panel.appendChild(title);

  const list = document.createElement("div");
  panel.appendChild(list);

  host.appendChild(panel);

  /* ---------- RENDER ---------- */
  const render = () => {
    const data = JSON.parse(localStorage.getItem(KEY) || "[]");
    list.innerHTML = "";

    data.slice().reverse().forEach(item => {
      const row = document.createElement("div");
      row.textContent = `${new Date(item.at).toLocaleTimeString()} · ${item.msg}`;
      row.style.opacity = "0.85";
      row.style.marginBottom = "4px";
      list.appendChild(row);
    });
  };

  render();
  setInterval(render, 1000);

})();
