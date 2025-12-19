/* =========================================================
   OTOS — ANDY ENGINE v1.7
   ONE ACTION SURFACE (READ-ONLY, SAFE)
   Scope: Top Action → UI display
   RULES: No layout mutation, no removals, no reflow
   ========================================================= */

(() => {

  /* ---------- STATE ---------- */
  const STATE = {
    engine: "Andy v1.7",
    topAction: null
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

  /* ---------- LOAD TOP ACTION ---------- */
  const raw = localStorage.getItem("OTOS_TOP_ACTION");
  if (!raw) {
    highlight("No Top Action found");
    return;
  }

  try {
    STATE.topAction = JSON.parse(raw);
  } catch {
    highlight("Failed to parse Top Action");
    return;
  }

  /* ---------- SURFACE INTO UI ---------- */
  const actionCard = cardByTitle("One Action");
  if (!actionCard) {
    highlight("One Action card not found");
    return;
  }

  // safe append only
  const block = document.createElement("div");
  block.style.marginTop = "8px";
  block.style.fontSize = "13px";
  block.style.color = "#0f172a";

  block.innerHTML = `
    <strong>${STATE.topAction.description}</strong><br>
    <span style="color:#475569">
      Source: ${STATE.topAction.source}<br>
      Priority score: ${STATE.topAction.score}
    </span>
  `;

  actionCard.appendChild(block);

  /* ---------- SIGNAL ---------- */
  highlight("Top Action surfaced (read-only)");
  localStorage.setItem("OTOS_ONE_ACTION_READY", "true");

})();
