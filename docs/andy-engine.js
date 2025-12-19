/* =========================================================
   OTOS — ANDY ENGINE v1.8
   ONE ACTION CONTROLS (SAFE, NON-DESTRUCTIVE)
   Scope: Snooze / Complete / Next Action
   Mode: Local-state only
   ========================================================= */

(() => {

  /* ---------- STATE ---------- */
  const STATE = {
    engine: "Andy v1.8",
    topAction: null,
    history: []
  };

  /* ---------- HELPERS ---------- */
  const cardByTitle = (title) =>
    Array.from(document.querySelectorAll(".card"))
      .find(c => c.querySelector("h3")?.textContent.trim() === title);

  const highlight = (msg) => {
    const report = cardByTitle("Running Highlight Report");
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  const loadTopAction = () => {
    const raw = localStorage.getItem("OTOS_TOP_ACTION");
    if (!raw) return null;
    try { return JSON.parse(raw); }
    catch { return null; }
  };

  const saveHistory = (entry) => {
    STATE.history.push(entry);
    localStorage.setItem(
      "OTOS_ACTION_HISTORY",
      JSON.stringify(STATE.history, null, 2)
    );
  };

  /* ---------- LOAD ---------- */
  STATE.topAction = loadTopAction();
  if (!STATE.topAction) {
    highlight("No active Top Action");
    return;
  }

  /* ---------- UI HOOK ---------- */
  const actionCard = cardByTitle("One Action");
  if (!actionCard) {
    highlight("One Action card missing");
    return;
  }

  const controls = document.createElement("div");
  controls.style.marginTop = "10px";
  controls.style.display = "flex";
  controls.style.gap = "8px";

  const btnComplete = document.createElement("button");
  btnComplete.textContent = "Complete";

  const btnSnooze = document.createElement("button");
  btnSnooze.textContent = "Snooze";

  const btnNext = document.createElement("button");
  btnNext.textContent = "Next Action";

  controls.appendChild(btnComplete);
  controls.appendChild(btnSnooze);
  controls.appendChild(btnNext);
  actionCard.appendChild(controls);

  /* ---------- ACTIONS ---------- */
  btnComplete.onclick = () => {
    saveHistory({ action: STATE.topAction, result: "COMPLETED", at: Date.now() });
    localStorage.removeItem("OTOS_TOP_ACTION");
    highlight("Top Action marked COMPLETE");
  };

  btnSnooze.onclick = () => {
    saveHistory({ action: STATE.topAction, result: "SNOOZED", at: Date.now() });
    highlight("Top Action snoozed (manual resurface later)");
  };

  btnNext.onclick = () => {
    const all = JSON.parse(localStorage.getItem("OTOS_ACTIONS") || "[]");
    const next = all.find(a => a.id !== STATE.topAction.id);
    if (!next) {
      highlight("No further actions available");
      return;
    }
    localStorage.setItem("OTOS_TOP_ACTION", JSON.stringify(next));
    highlight("Next Action promoted");
    location.reload();
  };

  /* ---------- READY ---------- */
  highlight("One Action controls enabled");
  localStorage.setItem("OTOS_ACTION_CONTROLS_READY", "true");

})();
