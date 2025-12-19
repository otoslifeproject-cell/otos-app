/* =========================================================
   OTOS — ANDY ENGINE v1.6
   ACTION DERIVATION + PRIORITY SCORING
   Scope: Classified Docs → Tasks → One Action
   No UI / CSS / layout mutations
   ========================================================= */

(() => {

  /* ---------- STATE ---------- */
  const STATE = {
    engine: "Andy v1.6",
    tasks: [],
    actions: [],
    topAction: null
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

  const getBuckets = () => {
    const raw = localStorage.getItem("OTOS_CLASSIFIED_DOCS");
    if (!raw) return null;
    try { return JSON.parse(raw); }
    catch { return null; }
  };

  /* ---------- TASK DERIVATION ---------- */
  const deriveTasks = (bucket, doc) => ({
    id: crypto.randomUUID(),
    source: doc.name,
    bucket,
    createdAt: new Date().toISOString(),
    urgency: Math.floor(Math.random() * 10) + 1,
    impact: Math.floor(Math.random() * 10) + 1,
    description: `Review ${doc.name} (${bucket})`
  });

  /* ---------- ACTION SCORING ---------- */
  const scoreTask = (task) =>
    Math.round((task.urgency * 0.6) + (task.impact * 0.4));

  /* ---------- EXECUTION ---------- */
  const buckets = getBuckets();
  if (!buckets) {
    highlight("No classified docs — skipping task derivation");
    return;
  }

  Object.entries(buckets).forEach(([bucket, docs]) => {
    docs.forEach(doc => {
      const task = deriveTasks(bucket, doc);
      task.score = scoreTask(task);
      STATE.tasks.push(task);
    });
  });

  if (!STATE.tasks.length) {
    highlight("No tasks generated");
    return;
  }

  STATE.actions = STATE.tasks.sort((a, b) => b.score - a.score);
  STATE.topAction = STATE.actions[0];

  /* ---------- PERSIST ---------- */
  localStorage.setItem("OTOS_TASKS", JSON.stringify(STATE.tasks, null, 2));
  localStorage.setItem("OTOS_ACTIONS", JSON.stringify(STATE.actions, null, 2));
  localStorage.setItem("OTOS_TOP_ACTION", JSON.stringify(STATE.topAction, null, 2));

  /* ---------- SIGNAL ---------- */
  highlight(`Tasks generated: ${STATE.tasks.length}`);
  highlight(`Top Action → ${STATE.topAction.description} (score ${STATE.topAction.score})`);
  highlight("Andy ready to surface One Action");

})();
