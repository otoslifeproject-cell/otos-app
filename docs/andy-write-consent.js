/* =========================================================
   OTOS — ANDY ENGINE v5.3
   WRITE CONSENT GATE + VISUAL CONFIRMATION
   Purpose: Explicit human consent before ANY Notion writes
   Location: otos-app/docs/andy-write-consent.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- STATE ---------- */
  const KEY = "OTOS_WRITE_CONSENT";
  const hasConsent = () => localStorage.getItem(KEY) === "GRANTED";

  /* ---------- TARGET ---------- */
  const host =
    document.getElementById("left") ||
    document.getElementById("center") ||
    document.body;

  /* ---------- PANEL ---------- */
  const wrap = document.createElement("div");
  wrap.style.padding = "14px";
  wrap.style.borderRadius = "14px";
  wrap.style.background = "#020617";
  wrap.style.color = "#e5e7eb";
  wrap.style.boxShadow = "0 16px 32px rgba(0,0,0,.25)";
  wrap.style.marginBottom = "12px";

  const title = document.createElement("div");
  title.textContent = "Notion Write Consent";
  title.style.fontWeight = "600";
  title.style.marginBottom = "8px";

  const status = document.createElement("div");
  status.style.opacity = "0.8";
  status.style.marginBottom = "10px";

  const btn = document.createElement("button");
  btn.style.padding = "10px 12px";
  btn.style.borderRadius = "12px";
  btn.style.border = "0";
  btn.style.cursor = "pointer";
  btn.style.fontWeight = "700";
  btn.style.color = "white";

  const setUI = () => {
    const ok = hasConsent();
    status.textContent = ok ? "Status: GRANTED" : "Status: NOT GRANTED";
    btn.textContent = ok ? "Revoke Consent" : "Grant Consent";
    btn.style.background = ok ? "#ef4444" : "#22c55e";
  };

  btn.onclick = () => {
    if (hasConsent()) {
      localStorage.removeItem(KEY);
    } else {
      localStorage.setItem(KEY, "GRANTED");
    }
    setUI();
  };

  wrap.appendChild(title);
  wrap.appendChild(status);
  wrap.appendChild(btn);
  host.prepend(wrap);
  setUI();

  /* ---------- GLOBAL GUARD ---------- */
  window.OTOS_CAN_WRITE_NOTION = () =>
    localStorage.getItem("OTOS_ANDY_STATUS") === "LIVE" &&
    hasConsent() &&
    localStorage.getItem("OTOS_QUIET_MODE") !== "ON";

})();
