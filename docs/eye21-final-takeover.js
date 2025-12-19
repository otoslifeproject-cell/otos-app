/* =========================================================
   OTOS — EYE21 FINAL TAKEOVER v1.0
   PARENT AUTHORITY HANDOFF + AUTO-SYSTEM QUIET MODE
   Purpose: Complete transition to EYE21, stop background churn,
            confirm Parent is in full control
   Location: otos-app/docs/eye21-final-takeover.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (localStorage.getItem("OTOS_ANDY_BASELINE") === null) return;

  /* ---------- STATE ---------- */
  const STATE = {
    eye: "EYE21",
    mode: "PARENT_CONTROL",
    takenAt: new Date().toISOString()
  };

  /* ---------- QUIET MODE ---------- */
  // Disable background loops by flag (respected by all engines)
  localStorage.setItem("OTOS_QUIET_MODE", "ON");

  /* ---------- PARENT OWNERSHIP ---------- */
  localStorage.setItem("OTOS_PARENT_NODE", "EYE21");
  localStorage.setItem("OTOS_PARENT_TAKEOVER", JSON.stringify(STATE));

  /* ---------- UI CONFIRMATION ---------- */
  const host =
    document.getElementById("left") ||
    document.getElementById("center") ||
    document.body;

  const panel = document.createElement("div");
  panel.style.padding = "20px";
  panel.style.borderRadius = "18px";
  panel.style.background = "linear-gradient(180deg,#020617,#020617)";
  panel.style.color = "white";
  panel.style.boxShadow = "0 28px 60px rgba(0,0,0,.4)";
  panel.style.marginBottom = "16px";

  const h = document.createElement("h2");
  h.textContent = "EYE21 · Parent Node";
  h.style.marginBottom = "8px";

  const s1 = document.createElement("div");
  s1.textContent = "Status: FULL CONTROL";
  s1.style.opacity = "0.9";

  const s2 = document.createElement("div");
  s2.textContent = "Andy: LIVE · Baseline Locked";
  s2.style.opacity = "0.75";
  s2.style.marginTop = "4px";

  const s3 = document.createElement("div");
  s3.textContent = `Takeover: ${new Date(STATE.takenAt).toLocaleTimeString()}`;
  s3.style.opacity = "0.6";
  s3.style.marginTop = "4px";

  panel.appendChild(h);
  panel.appendChild(s1);
  panel.appendChild(s2);
  panel.appendChild(s3);

  host.prepend(panel);

  /* ---------- FINAL MARK ---------- */
  localStorage.setItem("OTOS_EYE21_LIVE", "TRUE");

})();
