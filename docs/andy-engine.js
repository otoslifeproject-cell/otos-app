/* =========================================================
   ANDY ENGINE — SAFE BASELINE (NO LAYOUT TOUCHING)
   ========================================================= */

(() => {
  const ANDY = {
    tokens: false,
    stats: {
      processed: 0,
      queue: 0
    },
    highlight: [],
    log(msg) {
      this.highlight.push(msg);
      renderHighlights();
    }
  };

  /* -------------------------
     DOM LOOKUPS (STRICT)
  ------------------------- */
  const els = {
    issueToken: document.getElementById("issue-token"),
    revokeToken: document.getElementById("revoke-token"),
    ingestBtn: document.getElementById("ingest-btn"),
    fileInput: document.getElementById("file-input"),
    cmdInput: document.getElementById("cmd"),
    statProcessed: document.getElementById("stat-processed"),
    statQueue: document.getElementById("stat-queue"),
    highlight: document.getElementById("highlight-report")
  };

  if (!els.issueToken || !els.ingestBtn) {
    console.warn("ANDY: DOM not ready or ids missing");
    return;
  }

  /* -------------------------
     RENDER
  ------------------------- */
  function renderStats() {
    els.statProcessed.textContent = ANDY.stats.processed;
    els.statQueue.textContent = ANDY.stats.queue;
  }

  function renderHighlights() {
    if (!els.highlight) return;
    els.highlight.innerHTML = ANDY.highlight
      .slice(-5)
      .map(l => `<div>• ${l}</div>`)
      .join("");
  }

  /* -------------------------
     TOKEN CONTROL
  ------------------------- */
  els.issueToken.onclick = () => {
    ANDY.tokens = true;
    ANDY.log("Execution tokens issued");
  };

  els.revokeToken.onclick = () => {
    ANDY.tokens = false;
    ANDY.log("Execution tokens revoked");
  };

  /* -------------------------
     INGEST (SAFE / NO SIDE FX)
  ------------------------- */
  els.ingestBtn.onclick = () => {
    if (!ANDY.tokens) {
      ANDY.log("Blocked: no execution tokens");
      return;
    }

    const files = els.fileInput.files;
    if (!files || files.length === 0) {
      ANDY.log("No files selected");
      return;
    }

    const cmd = (els.cmdInput.value || "").toUpperCase().trim();

    ANDY.stats.queue += files.length;
    renderStats();
    ANDY.log(`Ingest started (${files.length} files, cmd=${cmd || "A"})`);

    // simulate safe processing
    setTimeout(() => {
      ANDY.stats.processed += files.length;
      ANDY.stats.queue = 0;
      renderStats();
      ANDY.log("Ingest complete (idle)");
    }, 500);
  };

  /* -------------------------
     BOOT STATE
  ------------------------- */
  ANDY.log("Andy engine ready (idle)");
  renderStats();
})();
