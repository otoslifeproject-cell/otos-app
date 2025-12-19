/* =========================================================
   OTOS — SYSTEM SNAPSHOT EXPORT v1.0
   Purpose: Capture a full, point-in-time system snapshot
            (state, queues, actions, projects, tasks)
   Scope: Read-only export + downloadable JSON
   Location: otos-app/docs/system-snapshot-export.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (localStorage.getItem("OTOS_EYE21_LIVE") !== "TRUE") return;

  /* ---------- COLLECT ---------- */
  const snapshot = {
    meta: {
      system: "OTOS",
      eye: "EYE21",
      takenAt: new Date().toISOString(),
      version: JSON.parse(localStorage.getItem("OTOS_ANDY_BASELINE") || "{}")
    },
    state: {
      parent: localStorage.getItem("OTOS_PARENT_NODE"),
      andy: localStorage.getItem("OTOS_ANDY_STATUS"),
      quiet: localStorage.getItem("OTOS_QUIET_MODE")
    },
    data: {
      staged: JSON.parse(localStorage.getItem("OTOS_STAGED_DOCS") || "[]"),
      classified: JSON.parse(localStorage.getItem("OTOS_CLASSIFIED_DOCS") || "{}"),
      actions: JSON.parse(localStorage.getItem("OTOS_ACTIONS") || "[]"),
      projects: JSON.parse(localStorage.getItem("OTOS_PROJECTS") || "{}"),
      tasks: JSON.parse(localStorage.getItem("OTOS_TASKS") || "[]"),
      activity: JSON.parse(localStorage.getItem("OTOS_ACTIVITY_STREAM") || "[]")
    }
  };

  /* ---------- EXPORT ---------- */
  const blob = new Blob(
    [JSON.stringify(snapshot, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `OTOS_SNAPSHOT_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  /* ---------- UI CONFIRM ---------- */
  const report = Array.from(document.querySelectorAll(".card"))
    .find(c => c.textContent.includes("Highlight"));
  if (report) {
    const d = document.createElement("div");
    d.textContent = "📦 System snapshot exported";
    report.appendChild(d);
  }

})();
