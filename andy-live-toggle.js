/* =========================================================
   OTOS — ANDY LIVE TOGGLE v1.0
   Purpose: One-click ON/OFF for Andy (sets OTOS_ANDY_STATUS)
   Location: otos-app/docs/andy-live-toggle.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- TARGET ---------- */
  const host =
    document.getElementById("left") ||
    document.getElementById("center") ||
    document.body;

  /* ---------- PANEL ---------- */
  const wrap = document.createElement("div");
  wrap.style.padding = "14px";
  wrap.style.borderRadius = "14px";
  wrap.style.background = "#0b1220";
  wrap.style.color = "#e5e7eb";
  wrap.style.boxShadow = "0 16px 32px rgba(0,0,0,.25)";
  wrap.style.marginBottom = "12px";

  const title = document.createElement("div");
  title.textContent = "Andy · Control";
  title.style.fontWeight = "600";
  title.style.marginBottom = "10px";

  const btn = document.createElement("button");
  btn.style.padding = "10px 12px";
  btn.style.borderRadius = "12px";
  btn.style.border = "0";
  btn.style.cursor = "pointer";
  btn.style.fontWeight = "700";

  const sub = document.createElement("div");
  sub.style.marginTop = "8px";
  sub.style.opacity = "0.7";
  sub.style.fontSize = "12px";

  const setBtn = () => {
    const live = localStorage.getItem("OTOS_ANDY_STATUS") === "LIVE";
    btn.textContent = live ? "Turn Andy OFF" : "Turn Andy ON";
    btn.style.background = live ? "#ef4444" : "#22c55e";
    btn.style.color = "white";
    sub.textContent = `Status: ${live ? "LIVE" : "OFF"} · Quiet: ${localStorage.getItem("OTOS_QUIET_MODE") || "OFF"}`;
  };

  btn.onclick = () => {
    const live = localStorage.getItem("OTOS_ANDY_STATUS") === "LIVE";
    localStorage.setItem("OTOS_ANDY_STATUS", live ? "OFF" : "LIVE");
    if (!live) localStorage.removeItem("OTOS_QUIET_MODE"); // resume
    setBtn();
  };

  wrap.appendChild(title);
  wrap.appendChild(btn);
  wrap.appendChild(sub);

  host.prepend(wrap);
  setBtn();

})();
