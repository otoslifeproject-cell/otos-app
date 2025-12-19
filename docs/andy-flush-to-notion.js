/* =========================================================
   OTOS — ANDY ENGINE v5.7
   MANUAL FLUSH → NOTION (SAFE TRIGGER)
   Purpose: Explicit human-triggered write of classified docs
   Location: otos-app/docs/andy-flush-to-notion.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (!window.OTOS_CAN_WRITE_NOTION || !window.OTOS_CAN_WRITE_NOTION()) return;

  /* ---------- KEYS ---------- */
  const CLASS_KEY = "OTOS_CLASSIFIED_DOCS";
  const ACT_KEY   = "OTOS_ACTIVITY_STREAM";

  const classified = JSON.parse(localStorage.getItem(CLASS_KEY) || "{}");
  const activity   = JSON.parse(localStorage.getItem(ACT_KEY) || "[]");

  /* ---------- HELPERS ---------- */
  const push = (msg) => {
    activity.push({ at: new Date().toISOString(), msg });
    localStorage.setItem(ACT_KEY, JSON.stringify(activity));
  };

  /* ---------- HOST ---------- */
  const host =
    document.getElementById("center") ||
    document.getElementById("left") ||
    document.body;

  /* ---------- UI ---------- */
  const wrap = document.createElement("div");
  wrap.style.padding = "14px";
  wrap.style.borderRadius = "14px";
  wrap.style.background = "#020617";
  wrap.style.color = "#e5e7eb";
  wrap.style.boxShadow = "0 18px 36px rgba(0,0,0,.3)";
  wrap.style.marginBottom = "12px";

  const title = document.createElement("div");
  title.textContent = "Andy · Flush to Notion";
  title.style.fontWeight = "700";
  title.style.marginBottom = "8px";

  const btn = document.createElement("button");
  btn.textContent = "Write Classified Docs";
  btn.style.padding = "10px 14px";
  btn.style.borderRadius = "12px";
  btn.style.border = "0";
  btn.style.cursor = "pointer";
  btn.style.fontWeight = "700";
  btn.style.background = "#3b82f6";
  btn.style.color = "white";

  const note = document.createElement("div");
  note.style.marginTop = "6px";
  note.style.fontSize = "12px";
  note.style.opacity = "0.7";
  note.textContent = "Writes only items not yet written";

  btn.onclick = () => {
    let count = 0;
    Object.values(classified).forEach(arr => {
      arr.forEach(d => {
        if (!d.written) count++;
      });
    });
    push(`🚀 Flush requested (${count} pending docs)`);
    localStorage.setItem(CLASS_KEY, JSON.stringify(classified));
  };

  wrap.appendChild(title);
  wrap.appendChild(btn);
  wrap.appendChild(note);
  host.prepend(wrap);

})();
