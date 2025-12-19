/* =========================================================
   OTOS — ANDY ENGINE v6.0
   FILE ACCEPT CONFIRMATION + FEEDBACK LOOP
   Purpose: Make file intake explicit (accept / reject visible)
   Location: otos-app/docs/andy-intake-confirm.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (window.OTOS_ANDY_INTAKE_CONFIRM_ACTIVE) return;
  window.OTOS_ANDY_INTAKE_CONFIRM_ACTIVE = true;

  const STAGED_KEY = "OTOS_STAGED_DOCS";
  const ACT_KEY = "OTOS_ACTIVITY_STREAM";

  /* ---------- HELPERS ---------- */
  const push = (msg) => {
    const a = JSON.parse(localStorage.getItem(ACT_KEY) || "[]");
    a.push({ at: new Date().toISOString(), msg });
    localStorage.setItem(ACT_KEY, JSON.stringify(a));
  };

  /* ---------- PATCH FEEDER UI ---------- */
  const list = document.querySelector("#andy-intake-list") ||
               document.querySelector("#center") ||
               document.body;

  const staged = JSON.parse(localStorage.getItem(STAGED_KEY) || "[]");

  staged.forEach((doc, i) => {
    if (doc.confirmed) return;

    doc.confirmed = true;
    push(`📥 Accepted → ${doc.name}`);
  });

  localStorage.setItem(STAGED_KEY, JSON.stringify(staged));

})();
