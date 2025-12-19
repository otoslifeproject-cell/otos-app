/* =========================================================
   OTOS — ANDY ENGINE v5.5
   STAGED → CLASSIFIED PIPELINE (ANALYSE)
   Purpose: Move staged files into classified buckets
            without Notion writes (prep only)
   Location: otos-app/docs/andy-classifier.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

  /* ---------- KEYS ---------- */
  const STAGED_KEY = "OTOS_STAGED_DOCS";
  const CLASS_KEY  = "OTOS_CLASSIFIED_DOCS";
  const ACT_KEY    = "OTOS_ACTIVITY_STREAM";

  const staged = JSON.parse(localStorage.getItem(STAGED_KEY) || "[]");
  const classified = JSON.parse(localStorage.getItem(CLASS_KEY) || "{}");
  const activity = JSON.parse(localStorage.getItem(ACT_KEY) || "[]");

  /* ---------- HELPERS ---------- */
  const pushActivity = (msg) => {
    activity.push({ at: new Date().toISOString(), msg });
    localStorage.setItem(ACT_KEY, JSON.stringify(activity));
  };

  const bucketFor = (name) => {
    const n = name.toLowerCase();
    if (n.includes("revenue") || n.includes("fund")) return "REVENUE";
    if (n.includes("gold") || n.includes("statement")) return "GOLDEN";
    if (n.includes("task") || n.includes("todo")) return "TASK";
    if (n.includes("canon") || n.includes("final")) return "CANON";
    return "ANALYSE";
  };

  /* ---------- INIT BUCKETS ---------- */
  ["ANALYSE","GOLDEN","REVENUE","CANON","TASK"].forEach(b => {
    if (!classified[b]) classified[b] = [];
  });

  /* ---------- PROCESS ---------- */
  staged.forEach(doc => {
    if (doc.accepted) return;

    const bucket = bucketFor(doc.name);
    classified[bucket].push({
      name: doc.name,
      size: doc.size,
      type: doc.type,
      command: bucket,
      acceptedAt: new Date().toISOString(),
      written: false
    });

    doc.accepted = true;
    pushActivity(`📂 Classified → ${bucket}: ${doc.name}`);
  });

  /* ---------- SAVE ---------- */
  localStorage.setItem(STAGED_KEY, JSON.stringify(staged));
  localStorage.setItem(CLASS_KEY, JSON.stringify(classified));

})();
