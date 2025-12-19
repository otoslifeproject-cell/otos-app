/* ======================================================
   ANDY ENGINE v1.0 — SAFE INGEST + HIGHLIGHTS
   Contract: EYE20 (read-only, no promotion)
   ====================================================== */

(() => {
  const state = {
    tokens: null,
    registry: [],
    queue: [],
    processed: 0,
    highlights: []
  };

  const $ = (id) => document.getElementById(id);

  /* ---------- Registry ---------- */
  async function loadRegistry() {
    try {
      const res = await fetch("registry.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Registry HTTP error");
      state.registry = await res.json();
      console.log("Registry loaded", state.registry);
      return true;
    } catch (e) {
      console.error("Registry load failed", e);
      banner("Registry load failed", "error");
      return false;
    }
  }

  /* ---------- Tokens ---------- */
  function issueTokens() {
    state.tokens = {
      ingest: true,
      read: true,
      suggest: true
    };
    banner("Execution tokens issued", "ok");
  }

  function revokeTokens() {
    state.tokens = null;
    banner("Execution tokens revoked", "warn");
  }

  /* ---------- Ingest ---------- */
  async function ingestFiles(files, mode) {
    if (!state.tokens?.ingest) {
      banner("No ingest token", "error");
      return;
    }

    for (const file of files) {
      state.queue.push(file);
    }

    processQueue(mode);
  }

  async function processQueue(mode) {
    while (state.queue.length) {
      const file = state.queue.shift();
      await analyseFile(file, mode);
      state.processed++;
      updateStats();
    }
    banner("Batch complete", "ok");
  }

  async function analyseFile(file, mode) {
    const text = await file.text();

    const signals = {
      golden: /golden|canonical|flagship|core/i.test(text),
      revenue: /revenue|income|£|\$/i.test(text),
      tasks: /todo|task|blocker|next action/i.test(text),
      nhs: /nhs|ics|trust|commission/i.test(text)
    };

    if (signals.golden) pushHighlight("Golden language detected", file.name);
    if (signals.revenue) pushHighlight("Revenue signal", file.name);
    if (signals.tasks) pushHighlight("Task / blocker detected", file.name);
    if (signals.nhs) pushHighlight("NHS-relevant content", file.name);

    archiveTier3(file.name, text, signals);
  }

  /* ---------- Highlight ---------- */
  function pushHighlight(label, source) {
    state.highlights.push({ label, source, ts: new Date().toISOString() });
    renderHighlights();
  }

  function renderHighlights() {
    const box = document.getElementById("highlight-report");
    if (!box) return;
    box.innerHTML = state.highlights
      .slice(-10)
      .map(h => `• ${h.label} — ${h.source}`)
      .join("<br>");
  }

  /* ---------- Archive ---------- */
  function archiveTier3(name, content, signals) {
    const record = {
      name,
      content,
      signals,
      ts: new Date().toISOString()
    };
    const store = JSON.parse(localStorage.getItem("andy-archive") || "[]");
    store.push(record);
    localStorage.setItem("andy-archive", JSON.stringify(store));
  }

  function exportArchive() {
    const data = localStorage.getItem("andy-archive");
    if (!data) return;
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "andy-tier3-archive.json";
    a.click();
  }

  /* ---------- UI ---------- */
  function banner(msg, type) {
    console.log(`[${type}]`, msg);
  }

  function updateStats() {
    if ($("stat-processed")) $("stat-processed").textContent = state.processed;
    if ($("stat-queue")) $("stat-queue").textContent = state.queue.length;
  }

  /* ---------- Bindings ---------- */
  window.ANDY = {
    loadRegistry,
    issueTokens,
    revokeTokens,
    ingestFiles,
    exportArchive
  };

  loadRegistry();
})();
