/* =========================================================
   OTOS — ANDY ENGINE v3.0
   TIER-1 CLASSIFIER (STAGED → CLASSIFIED)
   Purpose: Promote Tier-0 intake into structured buckets
   Location: otos-app/docs/andy-classifier.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- STATE ---------- */
  const staged = JSON.parse(localStorage.getItem("OTOS_STAGED_DOCS") || "[]");
  const classified = JSON.parse(localStorage.getItem("OTOS_CLASSIFIED_DOCS") || "{}");

  /* ---------- HELPERS ---------- */
  const highlight = (msg) => {
    const report = Array.from(document.querySelectorAll(".card"))
      .find(c => c.textContent.includes("Highlight"));
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  const bucketFor = (cmd) => {
    switch (cmd) {
      case "G": return "GOLDEN";
      case "R": return "REVENUE";
      case "C": return "CANON";
      case "T": return "TASK";
      default:  return "ANALYSE";
    }
  };

  /* ---------- CLASSIFY ---------- */
  if (!staged.length) {
    highlight("Classifier idle — no staged docs");
    return;
  }

  staged.forEach(doc => {
    const bucket = bucketFor(doc.command);
    if (!classified[bucket]) classified[bucket] = [];
    classified[bucket].push({
      ...doc,
      classifiedAt: new Date().toISOString()
    });
    highlight(`📂 Classified: ${doc.name} → ${bucket}`);
  });

  /* ---------- COMMIT STATE ---------- */
  localStorage.setItem("OTOS_CLASSIFIED_DOCS", JSON.stringify(classified));
  localStorage.removeItem("OTOS_STAGED_DOCS");

  highlight("Tier-1 classification complete");

})();
