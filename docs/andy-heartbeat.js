/* =========================================================
   OTOS — ANDY ENGINE v5.9
   PIPELINE HEARTBEAT + VISUAL PULSE
   Purpose: Prove Andy is alive, looping, and not stalled
   Location: otos-app/docs/andy-heartbeat.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (window.OTOS_ANDY_HEARTBEAT_ACTIVE) return;
  window.OTOS_ANDY_HEARTBEAT_ACTIVE = true;

  const KEY = "OTOS_HEARTBEAT";
  const ACT_KEY = "OTOS_ACTIVITY_STREAM";

  /* ---------- HOST ---------- */
  const host =
    document.getElementById("right") ||
    document.getElementById("center") ||
    document.body;

  /* ---------- UI ---------- */
  const dot = document.createElement("div");
  dot.style.width = "10px";
  dot.style.height = "10px";
  dot.style.borderRadius = "50%";
  dot.style.background = "#22c55e";
  dot.style.boxShadow = "0 0 0 rgba(34,197,94,0.7)";
  dot.style.animation = "pulse 2s infinite";
  dot.style.marginBottom = "10px";

  const label = document.createElement("div");
  label.textContent = "Andy · Heartbeat";
  label.style.fontSize = "12px";
  label.style.opacity = "0.7";
  label.style.marginBottom = "6px";

  const wrap = document.createElement("div");
  wrap.style.padding = "10px 12px";
  wrap.style.borderRadius = "14px";
  wrap.style.background = "#020617";
  wrap.style.color = "#e5e7eb";
  wrap.style.boxShadow = "0 14px 30px rgba(0,0,0,.3)";
  wrap.style.marginBottom = "12px";

  /* ---------- STYLE ---------- */
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.7); }
      70% { box-shadow: 0 0 0 10px rgba(34,197,94,0); }
      100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
    }
  `;
  document.head.appendChild(style);

  wrap.appendChild(label);
  wrap.appendChild(dot);
  host.prepend(wrap);

  /* ---------- LOOP ---------- */
  setInterval(() => {
    const now = new Date().toISOString();
    localStorage.setItem(KEY, now);

    const activity = JSON.parse(localStorage.getItem(ACT_KEY) || "[]");
    activity.push({ at: now, msg: "💓 Andy heartbeat" });
    localStorage.setItem(ACT_KEY, JSON.stringify(activity));
  }, 5000);

})();
