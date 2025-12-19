/* =========================================================
   ANDY · EXECUTION AGENT (SAFE CORE)
   - NO layout mutation
   - NO CSS access
   - Token-gated
   - Local only
   ========================================================= */

(function () {
  const state = {
    tokensIssued: false,
    processed: 0,
    queue: 0,
    highlights: []
  };

  // ---- DOM SAFE GETTERS ----
  const $ = (id) => document.getElementById(id);

  const statProcessed = () => $("stat-processed");
  const statQueue = () => $("stat-queue");
  const highlightBox = () => $("highlight-report");

  // ---- RENDER (TEXT ONLY) ----
  function renderStats() {
    if (statProcessed()) statProcessed().textContent = state.processed;
    if (statQueue()) statQueue().textContent = state.queue;
  }

  function renderHighlights() {
    if (!highlightBox()) return;
    highlightBox.innerHTML = "";
    state.highlights.slice(-10).forEach((h) => {
      const div = document.createElement("div");
      div.textContent = "• " + h;
      highlightBox.appendChild(div);
    });
  }

  // ---- TOKEN CONTROL ----
  function issueTokens() {
    state.tokensIssued = true;
  }

  function revokeTokens() {
    state.tokensIssued = false;
  }

  // ---- INGEST CORE ----
  function ingestFiles(files, mode) {
    if (!state.tokensIssued) {
      alert("Tokens required.");
      return;
    }
    if (!files || files.length === 0) return;

    state.queue += files.length;
    renderStats();

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        state.queue--;
        state.processed++;
        state.highlights.push(
          `[${mode}] ${file.name} (${file.type || "unknown"})`
        );
        renderStats();
        renderHighlights();
      };
      reader.readAsText(file);
    });
  }

  // ---- EXPORT ----
  function exportArchive() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            processed: state.processed,
            highlights: state.highlights
          },
          null,
          2
        )
      ],
      { type: "application/json" }
    );

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "andy-tier3-archive.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ---- PUBLIC API ----
  window.ANDY = {
    issueTokens,
    revokeTokens,
    ingestFiles,
    exportArchive
  };

  // ---- EVENT WIRING (NO LAYOUT) ----
  window.addEventListener("DOMContentLoaded", () => {
    if ($("issue-token"))
      $("issue-token").addEventListener("click", issueTokens);

    if ($("revoke-token"))
      $("revoke-token").addEventListener("click", revokeTokens);

    if ($("ingest-btn"))
      $("ingest-btn").addEventListener("click", () => {
        ingestFiles(
          $("file-input").files,
          $("cmd").value || "A"
        );
      });

    if ($("export-archive"))
      $("export-archive").addEventListener("click", exportArchive);

    renderStats();
  });
})();

