/* =========================================================
   OTOS — ANDY ENGINE v5.6
   LIVE ACTIVITY STREAM (VISUAL)
   Purpose: Surface Andy pipeline events in real time
   Location: otos-app/docs/andy-activity-stream.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (window.OTOS_ACTIVITY_STREAM_ACTIVE) return;
  window.OTOS_ACTIVITY_STREAM_ACTIVE = true;

  const KEY = "OTOS_ACTIVITY_STREAM";

  /* ---------- HOST ---------- */
  const host =
    document.getElementById("right") ||
    document.getElementById("center") ||
    document.body;

  /* ---------- UI ---------- */
  const wrap = document.createElement("div");
  wrap.style.padding = "16px";
  wrap.style.borderRadius = "16px";
  wrap.style.background = "#020617";
  wrap.style.color = "#e5e7eb";
  wrap.style.boxShadow = "0 20px 40px rgba(0,0,0,.35)";
  wrap.style.marginBottom = "14px";
  wrap.style.maxHeight = "360px";
  wrap.style.overflowY = "auto";

  const title = document.createElement("div");
  title.textContent = "Andy · Activity";
  title.style.fontWeight = "700";
  title.style.marginBottom = "10px";

  const list = document.createElement("div");
  list.style.fontSize = "12px";
  list.style.lineHeight = "1.4";

  /* ---------- RENDER ---------- */
  const render = () => {
    list.innerHTML = "";
    const items = JSON.parse(localStorage.getItem(KEY) || "[]");
    items.slice(-50).reverse().forEach(e => {
      const row = document.createElement("div");
      row.style.padding = "6px 0";
      row.style.opacity = "0.85";
      row.textContent = `${new Date(e.at).toLocaleTimeString()} · ${e.msg}`;
      list.appendChild(row);
    });
  };

  /* ---------- WATCH ---------- */
  setInterval(render, 1000);

  /* ---------- MOUNT ---------- */
  wrap.appendChild(title);
  wrap.appendChild(list);
  host.prepend(wrap);
  render();

})();
