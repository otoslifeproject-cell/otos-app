/* =========================================================
   OTOS — ANDY ENGINE v2.2
   PARENT COMMAND CONSOLE (SAFE MODE)
   Scope: Manual commands → Andy (no autonomy)
   Behaviour only. No UI / CSS changes.
   ========================================================= */

(() => {

  /* ---------- STATE ---------- */
  const STATE = {
    engine: "Andy v2.2",
    safeMode: true,
    commands: []
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

  const save = (key, val) =>
    localStorage.setItem(key, JSON.stringify(val, null, 2));

  /* ---------- COMMAND INPUT ---------- */
  const intakeCard = cardByTitle("Intake");
  if (!intakeCard) {
    highlight("Command console not found");
    return;
  }

  const cmdInput = intakeCard.querySelector("input[type='text']");
  const ingestBtn = Array.from(intakeCard.querySelectorAll("button"))
    .find(b => b.textContent.includes("Ingest"));

  if (!cmdInput || !ingestBtn) {
    highlight("Command bindings missing");
    return;
  }

  /* ---------- COMMAND HANDLER ---------- */
  ingestBtn.addEventListener("click", () => {
    const raw = (cmdInput.value || "").trim();
    if (!raw) {
      highlight("No command provided");
      return;
    }

    const cmd = {
      id: crypto.randomUUID(),
      raw,
      issuedAt: new Date().toISOString(),
      safeMode: STATE.safeMode
    };

    STATE.commands.push(cmd);
    save("OTOS_PARENT_COMMANDS", STATE.commands);

    highlight(`Command received: "${raw}"`);
    highlight(`Mode: ${STATE.safeMode ? "SAFE" : "LIVE"}`);

    // Command routing (non-executing)
    if (/^ANALYZE|^A\b/i.test(raw)) {
      highlight("Routed → ANALYSE pipeline");
    } else if (/^GOLDEN|^G\b/i.test(raw)) {
      highlight("Routed → GOLDEN statements");
    } else if (/^REVENUE|^R\b/i.test(raw)) {
      highlight("Routed → REVENUE ideas");
    } else if (/^CANON|^C\b/i.test(raw)) {
      highlight("Routed → CANON docs");
    } else if (/^TASK|^T\b/i.test(raw)) {
      highlight("Routed → TASK generation");
    } else {
      highlight("Routed → GENERAL intake");
    }

    cmdInput.value = "";
  });

  /* ---------- SAFE MODE TOGGLE ---------- */
  const tokenCard = cardByTitle("Execution Tokens");
  if (tokenCard) {
    const revokeBtn = Array.from(tokenCard.querySelectorAll("button"))
      .find(b => b.textContent.includes("Revoke"));

    if (revokeBtn) {
      revokeBtn.addEventListener("click", () => {
        STATE.safeMode = true;
        highlight("SAFE MODE enforced (no live writes)");
      });
    }

    const issueBtn = Array.from(tokenCard.querySelectorAll("button"))
      .find(b => b.textContent.includes("Issue"));

    if (issueBtn) {
      issueBtn.addEventListener("click", () => {
        STATE.safeMode = false;
        highlight("LIVE MODE armed (Parent authorised)");
      });
    }
  }

  /* ---------- BOOT ---------- */
  save("OTOS_ANDY_MODE", { safeMode: STATE.safeMode });
  highlight("Parent Command Console online");

})();
