/* =========================================================
   OTOS — ANDY ENGINE v3.3
   ACTION EXTRACTOR (DOC → ACTIONS)
   Purpose: Surface next actions from analysed documents
   Location: otos-app/docs/andy-action-extractor.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

  /* ---------- STATE ---------- */
  const classified = JSON.parse(localStorage.getItem("OTOS_CLASSIFIED_DOCS") || "{}");
  const actions = JSON.parse(localStorage.getItem("OTOS_ACTIONS") || "[]");

  /* ---------- HELPERS ---------- */
  const highlight = (msg) => {
    const report = Array.from(document.querySelectorAll(".card"))
      .find(c => c.textContent.includes("Highlight"));
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  const scoreAction = (doc) => {
    let score = 3;
    if (doc.command === "T") score += 3;
    if (doc.command === "R") score += 2;
    if (doc.command === "G") score += 1;
    return Math.min(score, 10);
  };

  /* ---------- EXTRACT ---------- */
  Object.values(classified).flat().forEach(doc => {
    if (doc._actioned) return;

    const action = {
      id: crypto.randomUUID(),
      sourceDoc: doc.id,
      title: `Review: ${doc.name}`,
      score: scoreAction(doc),
      createdAt: new Date().toISOString(),
      status: "OPEN"
    };

    actions.push(action);
    doc._actioned = true;

    highlight(`🎯 Action created: ${action.title}`);
  });

  /* ---------- COMMIT ---------- */
  localStorage.setItem("OTOS_ACTIONS", JSON.stringify(actions));
  localStorage.setItem("OTOS_CLASSIFIED_DOCS", JSON.stringify(classified));

  highlight(`Actions total: ${actions.length}`);

})();
