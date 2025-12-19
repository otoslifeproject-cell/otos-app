/* ======================================================
   ANDY · EXECUTION ENGINE v1
   Scope: Intake → Analyse → Highlight → Archive
   Mode: Local-first, token-gated, no promotion
   ====================================================== */

const AndyEngine = (() => {
  const state = {
    tokens: false,
    queue: [],
    processed: 0,
    highlights: []
  };

  /* ---------- TOKEN CONTROL ---------- */

  function issueTokens() {
    state.tokens = true;
    log("Execution tokens ISSUED");
  }

  function revokeTokens() {
    state.tokens = false;
    log("Execution tokens REVOKED");
  }

  function canRun() {
    return state.tokens === true;
  }

  /* ---------- INGEST ---------- */

  function ingestFiles(files, command = "A") {
    if (!canRun()) {
      log("BLOCKED: No execution tokens");
      return;
    }

    [...files].forEach(file => {
      state.queue.push({
        file,
        command,
        status: "queued"
      });
    });

    log(`${files.length} file(s) queued`);
    processQueue();
  }

  /* ---------- PROCESS ---------- */

  async function processQueue() {
    while (state.queue.length > 0 && canRun()) {
      const item = state.queue.shift();
      await analyse(item);
      state.processed++;
      updateStats();
    }
  }

  async function analyse(item) {
    const text = await item.file.text();

    const result = {
      name: item.file.name,
      size: item.file.size,
      flags: detectSignals(text),
      summary: summarise(text)
    };

    state.highlights.push(result);
    log(`Processed: ${item.file.name}`);
  }

  /* ---------- INTELLIGENCE ---------- */

  function detectSignals(text) {
    const signals = [];

    if (/addiction|adhd|mental/i.test(text)) signals.push("CORE_THEME");
    if (/cost|£|\$/i.test(text)) signals.push("ECONOMIC_SIGNAL");
    if (/nhs|policy|probation/i.test(text)) signals.push("SYSTEM_SIGNAL");
    if (/quote|“|”/i.test(text)) signals.push("LANGUAGE_GOLD");

    return signals;
  }

  function summarise(text) {
    return text.slice(0, 400).replace(/\s+/g, " ") + "...";
  }

  /* ---------- EXPORT ---------- */

  function exportArchive() {
    const blob = new Blob(
      [JSON.stringify(state.highlights, null, 2)],
      { type: "application/json" }
    );

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "andy-tier3-archive.json";
    a.click();
  }

  /* ---------- UI HELPERS ---------- */

  function log(msg) {
    const box = document.querySelector("#andy-log");
    if (box) box.textContent += `\n${msg}`;
    console.log("[ANDY]", msg);
  }

  function updateStats() {
    document.querySelector("#andy-processed").textContent = state.processed;
    document.querySelector("#andy-queue").textContent = state.queue.length;
  }

  /* ---------- PUBLIC API ---------- */

  return {
    issueTokens,
    revokeTokens,
    ingestFiles,
    exportArchive
  };
})();

window.AndyEngine = AndyEngine;
