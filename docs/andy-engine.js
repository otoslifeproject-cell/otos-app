/* =========================================================
   OTOS — ANDY ENGINE v1.3
   COMMAND PARSER + CLASSIFIER
   Scope: A / G / R / C / T commands
   Output: Structured staging buckets (Notion-ready)
   No UI / CSS / layout changes
   ========================================================= */

(() => {

  /* ---------- STATE ---------- */
  const STATE = {
    engine: "Andy v1.3",
    mode: "CLASSIFY",
    buckets: {
      ANALYSE: [],
      GOLDEN: [],
      REVENUE: [],
      CANON: [],
      TASK: [],
      OTHER: []
    }
  };

  /* ---------- HELPERS ---------- */
  const cardByTitle = (title) =>
    Array.from(document.querySelectorAll("div"))
      .find(d => d.textContent?.trim().startsWith(title));

  const highlight = (msg) => {
    const report = cardByTitle("Running Highlight Report");
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  const getCommand = () => {
    const input = document.querySelector("input[placeholder*='Command']");
    return (input?.value || "A").trim().toUpperCase();
  };

  const getStaged = () => {
    const raw = localStorage.getItem("OTOS_STAGED_DOCS");
    if (!raw) return [];
    try { return JSON.parse(raw); }
    catch { return []; }
  };

  const persistBuckets = () => {
    localStorage.setItem(
      "OTOS_CLASSIFIED_DOCS",
      JSON.stringify(STATE.buckets, null, 2)
    );
  };

  /* ---------- CLASSIFIER ---------- */
  const classify = (doc, cmd) => {
    switch (cmd) {
      case "A":
        STATE.buckets.ANALYSE.push(doc);
        return "ANALYSE";
      case "G":
        STATE.buckets.GOLDEN.push(doc);
        return "GOLDEN";
      case "R":
        STATE.buckets.REVENUE.push(doc);
        return "REVENUE";
      case "C":
        STATE.buckets.CANON.push(doc);
        return "CANON";
      case "T":
        STATE.buckets.TASK.push(doc);
        return "TASK";
      default:
        STATE.buckets.OTHER.push(doc);
        return "OTHER";
    }
  };

  /* ---------- EXECUTION ---------- */
  const staged = getStaged();

  if (!staged.length) {
    highlight("No staged documents to classify");
    return;
  }

  const cmd = getCommand();
  highlight(`Classifying ${staged.length} document(s) with command [${cmd}]`);

  staged.forEach(doc => {
    const bucket = classify(doc, cmd);
    highlight(`→ ${doc.name} → ${bucket}`);
  });

  persistBuckets();

  highlight("Classification complete");
  highlight("Buckets saved (localStorage: OTOS_CLASSIFIED_DOCS)");

  /* ---------- READY SIGNAL ---------- */
  localStorage.setItem("OTOS_CLASSIFY_READY", "true");
  highlight("Andy ready for Notion bucket push");

})();
