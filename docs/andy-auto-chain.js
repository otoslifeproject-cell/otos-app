/* =========================================================
   OTOS — ANDY ENGINE v4.4
   INGEST → CLASSIFY AUTO-CHAIN
   Purpose: Automatically advance docs through pipeline
   Location: otos-app/docs/andy-auto-chain.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

  /* ---------- HELPERS ---------- */
  const run = (fnName) => {
    if (typeof window[fnName] === "function") {
      window[fnName]();
    }
  };

  /* ---------- AUTO-CHAIN ---------- */
  const chain = () => {
    run("OTOS_CLASSIFY");      // Tier-1 classify
    run("OTOS_EXTRACT_ACTIONS");
    run("OTOS_PRIORITISE");
  };

  /* ---------- TRIGGERS ---------- */
  window.addEventListener("storage", (e) => {
    if (e.key === "OTOS_STAGED_DOCS") chain();
  });

  /* ---------- BOOT ---------- */
  chain();

})();
