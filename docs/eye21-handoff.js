/* =========================================================
   OTOS — EYE21 HANDOFF v1.0
   PARENT NODE ACTIVATION + LOCK
   Purpose: Finalise Andy LIVE, freeze pipeline, promote EYE21
   Scope: Authority switch + visual confirmation
   Location: otos-app/docs/eye21-handoff.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (window.OTOS_EYE21_HANDOFF_ACTIVE) return;
  window.OTOS_EYE21_HANDOFF_ACTIVE = true;

  /* ---------- STATE ---------- */
  const ACT_KEY = "OTOS_ACTIVITY_STREAM";

  const push = (msg) => {
    const a = JSON.parse(localStorage.getItem(ACT_KEY) || "[]");
    a.push({ at: new Date().toISOString(), msg });
    localStorage.setItem(ACT_KEY, JSON.stringify(a));
  };

  /* ---------- ACTIVATE ---------- */
  localStorage.setItem("OTOS_PARENT_NODE", "EYE21");
  localStorage.setItem("OTOS_EYE21_LIVE", "TRUE");
  localStorage.setItem("OTOS_ANDY_STATUS", "LIVE");
  localStorage.setItem("OTOS_SYSTEM_LOCK", "PARENT");

  push("👁️ EYE21 activated as Parent Node");
  push("🔒 System authority locked to Parent");

  /* ---------- UI ---------- */
  const host =
    document.getElementById("center") ||
    document.getElementById("left") ||
    document.body;

  const card = document.createElement("div");
  card.style.padding = "22px";
  card.style.borderRadius = "22px";
  card.style.background = "linear-gradient(135deg,#0f172a,#020617)";
  card.style.color = "#e5e7eb";
  card.style.boxShadow = "0 40px 80px rgba(0,0,0,.55)";
  card.style.marginBottom = "20px";
  card.style.textAlign = "center";

  const h = document.createElement("div");
  h.textContent = "👁️ EYE21 · Parent Node LIVE";
  h.style.fontWeight = "900";
  h.style.fontSize = "22px";
  h.style.marginBottom = "8px";

  const s = document.createElement("div");
  s.textContent = "Andy operational · Pipeline active · Authority locked";
  s.style.opacity = "0.8";

  card.appendChild(h);
  card.appendChild(s);
  host.prepend(card);

})();
