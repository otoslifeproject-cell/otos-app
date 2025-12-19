/* =========================================================
   OTOS — ANDY ENGINE v3.2
   DEAD-LETTER QUEUE + RETRY CONTROLLER
   Purpose: Capture failures, retry safely, never lose docs
   Location: otos-app/docs/andy-retry-dlq.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

  /* ---------- CONFIG ---------- */
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1500;

  /* ---------- STATE ---------- */
  const dlq = JSON.parse(localStorage.getItem("OTOS_DLQ") || "[]");
  const classified = JSON.parse(localStorage.getItem("OTOS_CLASSIFIED_DOCS") || "{}");
  const retryState = JSON.parse(localStorage.getItem("OTOS_RETRY_STATE") || "{}");

  /* ---------- HELPERS ---------- */
  const highlight = (msg) => {
    const report = Array.from(document.querySelectorAll(".card"))
      .find(c => c.textContent.includes("Highlight"));
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  const now = () => Date.now();

  /* ---------- MARK FAILURES ---------- */
  Object.values(classified).flat().forEach(doc => {
    const key = doc.id;
    if (!retryState[key]) retryState[key] = { attempts: 0, last: 0 };

    // mark as eligible for retry if not written
    if (!doc.written && retryState[key].attempts < MAX_RETRIES) {
      const due = now() - retryState[key].last >= RETRY_DELAY_MS;
      if (due) {
        retryState[key].attempts += 1;
        retryState[key].last = now();
        doc._retry = true;
      }
    }

    // exceeded retries → DLQ
    if (retryState[key].attempts >= MAX_RETRIES && !doc._dead) {
      doc._dead = true;
      dlq.push({ ...doc, deadAt: new Date().toISOString() });
      highlight(`☠️ DLQ: ${doc.name}`);
    }
  });

  /* ---------- CLEAN CLASSIFIED ---------- */
  Object.entries(classified).forEach(([bucket, docs]) => {
    classified[bucket] = docs.filter(d => !d._dead);
  });

  /* ---------- COMMIT ---------- */
  localStorage.setItem("OTOS_CLASSIFIED_DOCS", JSON.stringify(classified));
  localStorage.setItem("OTOS_RETRY_STATE", JSON.stringify(retryState));
  localStorage.setItem("OTOS_DLQ", JSON.stringify(dlq));

  if (dlq.length) {
    highlight(`DLQ size: ${dlq.length}`);
  } else {
    highlight("DLQ empty");
  }

})();
