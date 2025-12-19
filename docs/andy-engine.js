/* =========================================================
   ANDY ENGINE v0.1
   Logic only — NO layout / NO CSS / NO DOM mutation beyond IDs
   ========================================================= */

/* ---------- STATE ---------- */

const AndyState = {
  tokensIssued: false,
  processed: 0,
  queue: 0,
  highlights: []
};

/* ---------- DOM ---------- */

const issueBtn = document.getElementById("issue-token");
const revokeBtn = document.getElementById("revoke-token");
const ingestBtn = document.getElementById("ingest-btn");

const fileInput = document.getElementById("file-input");
const cmdInput = document.getElementById("cmd");

const statProcessed = document.getElementById("stat-processed");
const statQueue = document.getElementById("stat-queue");
const highlightBox = document.getElementById("highlight-report");

/* ---------- HELPERS ---------- */

function renderStats() {
  statProcessed.textContent = AndyState.processed;
  statQueue.textContent = AndyState.queue;
}

function addHighlight(text) {
  AndyState.highlights.unshift(text);
  AndyState.highlights = AndyState.highlights.slice(0, 10);
  highlightBox.innerHTML = AndyState.highlights
    .map(h => `<div>• ${h}</div>`)
    .join("");
}

/* ---------- TOKEN CONTROL ---------- */

issueBtn.addEventListener("click", () => {
  AndyState.tokensIssued = true;
  addHighlight("Execution tokens issued");
});

revokeBtn.addEventListener("click", () => {
  AndyState.tokensIssued = false;
  addHighlight("Execution tokens revoked");
});

/* ---------- INGEST ---------- */

ingestBtn.addEventListener("click", () => {
  if (!AndyState.tokensIssued) {
    addHighlight("Blocked: no execution tokens");
    return;
  }

  const files = fileInput.files;
  const cmd = (cmdInput.value || "").toUpperCase();

  if (!files || files.length === 0) {
    addHighlight("No files selected");
    return;
  }

  AndyState.queue += files.length;
  renderStats();

  Array.from(files).forEach((file, idx) => {
    setTimeout(() => {
      AndyState.queue -= 1;
      AndyState.processed += 1;

      addHighlight(
        `Ingested "${file.name}" as ${cmd || "UNCLASSIFIED"}`
      );

      renderStats();
    }, 300 * (idx + 1));
  });

  fileInput.value = "";
  cmdInput.value = "";
});

/* ---------- INIT ---------- */

renderStats();
addHighlight("Andy engine ready (idle)");
