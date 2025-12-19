/* =========================================================
   OTOS · Andy Intake (Tier-3 archive only)
   Token-gated ingestion, running highlight report, export JSON
   ========================================================= */

const $ = (id) => document.getElementById(id);

const STATE_KEY = "OTOS_TIER3_ARCHIVE_V1";
const TOKENS_KEY = "OTOS_TOKENS_V1";

const ui = {
  tickerText: $("tickerText"),
  tempSlider: $("tempSlider"),
  tempVal: $("tempVal"),
  tokenStatus: $("tokenStatus"),
  andyGate: $("andyGate"),
  andyState: $("andyState"),
  filesProcessed: $("filesProcessed"),
  filesQueued: $("filesQueued"),
  lastCompleted: $("lastCompleted"),
  readySignal: $("readySignal"),
  dropzone: $("dropzone"),
  filePicker: $("filePicker"),
  cmdInput: $("cmdInput"),
  btnIngest: $("btnIngest"),
  btnIssueToken: $("btnIssueToken"),
  btnRevokeTokens: $("btnRevokeTokens"),
  btnExportTier3: $("btnExportTier3"),
  btnClearLocal: $("btnClearLocal"),
  highlightFeed: $("highlightFeed"),
  parentNotes: $("parentNotes"),
  oneAction: $("oneAction"),
};

function nowISO() {
  return new Date().toISOString();
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value, null, 2));
}

/* ---------------- Tokens (Parent issued) ---------------- */

function getTokens() {
  return loadJSON(TOKENS_KEY, { issued_at: null, scopes: [] });
}

function setTokens(scopes) {
  const t = { issued_at: nowISO(), scopes };
  saveJSON(TOKENS_KEY, t);
  return t;
}

function revokeTokens() {
  saveJSON(TOKENS_KEY, { issued_at: null, scopes: [] });
}

function hasScope(scope) {
  const t = getTokens();
  return t.scopes.includes(scope);
}

function refreshTokenUI() {
  const t = getTokens();
  const active = t.scopes.length > 0;
  ui.tokenStatus.textContent = active ? `${t.scopes.join(", ")} (issued ${t.issued_at})` : "None";
  ui.andyGate.style.display = active ? "none" : "flex";
  ui.tickerText.textContent = active
    ? "Tokens active · Andy ingestion enabled (archive-only)"
    : "System idle · No execution tokens issued";
}

/* ---------------- Tier-3 archive ---------------- */

function getArchive() {
  return loadJSON(STATE_KEY, {
    schema: "OTOS_TIER3_ARCHIVE_V1",
    created_at: nowISO(),
    items: [], // each item = {id, filename, size, type, cmd, added_at, highlight}
  });
}

function saveArchive(archive) {
  saveJSON(STATE_KEY, archive);
}

function addFeedItem(item) {
  const el = document.createElement("div");
  el.className = "feed-item";

  const head = document.createElement("div");
  head.className = "feed-head";

  const title = document.createElement("div");
  title.className = "feed-title";
  title.textContent = item.filename;

  const meta = document.createElement("div");
  meta.className = "feed-meta";
  meta.textContent = `${item.cmd || "A"} · ${item.type || "unknown"} · ${Math.round(item.size/1024)} KB`;

  head.appendChild(title);
  head.appendChild(meta);

  const body = document.createElement("div");
  body.className = "small";
  body.textContent = item.highlight.summary;

  const tags = document.createElement("div");
  tags.className = "tagrow";
  item.highlight.tags.forEach(t => {
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.textContent = t;
    tags.appendChild(tag);
  });

  el.appendChild(head);
  el.appendChild(body);
  el.appendChild(tags);

  ui.highlightFeed.prepend(el);
}

function setStats({ state, processed, queued, last, ready }) {
  ui.andyState.textContent = state;
  ui.filesProcessed.textContent = String(processed);
  ui.filesQueued.textContent = String(queued);
  ui.lastCompleted.textContent = last || "—";
  ui.readySignal.textContent = ready;
}

/* ---------------- Minimal “analysis” (browser-safe) ----------------
   This is NOT doing NHS verification and NOT promoting canon.
   It creates a highlight report per file (as required by contract),
   and stores everything to Tier-3 archive for later proper processing.
-------------------------------------------------------------------- */

function normaliseCmd(raw) {
  const c = (raw || "").trim().toUpperCase();
  if (!c) return "A";
  const first = c[0];
  return ["A","G","R","C","T","?"].includes(first) ? first : "A";
}

function deriveTags(cmd) {
  switch (cmd) {
    case "G": return ["Golden statements", "Metaphors", "Best language"];
    case "R": return ["Revenue opportunities", "Commercial angles", "Offers"];
    case "C": return ["Canonical candidate", "Needs promote signal", "Check duplicates"];
    case "T": return ["Tasks implied", "Blockers", "Dependencies"];
    case "?": return ["Notable", "Unusual", "Flag for review"];
    default:  return ["General analyse", "Classify", "Extract signals"];
  }
}

function quickHeuristicSummary(filename, cmd, textSample) {
  const base = `Extracted and classified (${cmd}). Stored to Tier-3 archive.`;

  // Tiny heuristics only (safe):
  const hints = [];
  const s = (textSample || "").toLowerCase();

  if (s.includes("otos")) hints.push("Contains OTOS references");
  if (s.includes("nhs") || s.includes("ics") || s.includes("probation")) hints.push("Contains NHS/ICS/Probation terms");
  if (s.includes("£") || s.match(/\b\d{1,3}(,\d{3})+\b/)) hints.push("Contains numbers / potential stats (flag for verification)");
  if (s.includes("golden statement") || s.includes("metaphor")) hints.push("Likely narrative fragments");

  const tail = hints.length ? ` Signals: ${hints.join(" · ")}.` : "";
  return base + tail;
}

async function readSmallText(file) {
  // Only attempt for small-ish text types. PDFs etc stay metadata-only.
  const isText =
    file.type.startsWith("text/") ||
    ["application/json"].includes(file.type) ||
    file.name.endsWith(".md") ||
    file.name.endsWith(".txt") ||
    file.name.endsWith(".csv");

  if (!isText) return "";

  // Safety: cap read size
  const MAX = 200_000; // ~200KB
  if (file.size > MAX) return "";

  try {
    return await file.text();
  } catch {
    return "";
  }
}

async function ingestBatch(files, cmdRaw) {
  if (!hasScope("INGEST")) return;

  const cmd = normaliseCmd(cmdRaw);
  const tags = deriveTags(cmd);

  const queue = Array.from(files || []);
  let processed = 0;

  setStats({ state: "ANALYSING", processed: 0, queued: queue.length, last: null, ready: "No (processing)" });

  const archive = getArchive();

  for (const f of queue) {
    const text = await readSmallText(f);
    const sample = text ? text.slice(0, 1200) : "";
    const summary = quickHeuristicSummary(f.name, cmd, sample);

    const item = {
      id: crypto.randomUUID(),
      filename: f.name,
      size: f.size,
      type: f.type || "unknown",
      cmd,
      added_at: nowISO(),
      highlight: {
        summary,
        tags,
        // These are placeholders ready for the real engine later:
        golden: [],
        canon_candidates: [],
        duplicates: [],
        blockers: [],
        stats_claims: text ? (summary.includes("numbers") ? ["POSSIBLE_NUMERIC_CLAIMS"] : []) : ["UNPARSED_BINARY_OR_LARGE_FILE"],
      }
    };

    archive.items.push(item);
    saveArchive(archive);

    processed += 1;
    addFeedItem(item);
    setStats({ state: "ANALYSING", processed, queued: queue.length - processed, last: f.name, ready: "No (processing)" });
  }

  setStats({ state: "READY", processed, queued: 0, last: queue.length ? queue[queue.length - 1].name : "—", ready: "Yes (ready for next)" });
}

/* ---------------- Export / Clear ---------------- */

function downloadJSON(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ---------------- Wire UI ---------------- */

function boot() {
  // Temperature
  ui.tempSlider.addEventListener("input", () => {
    ui.tempVal.textContent = ui.tempSlider.value;
  });

  // Tokens
  ui.btnIssueToken.addEventListener("click", () => {
    // Per contract: tokenised permissions, safe set.
    setTokens(["INGEST", "READ", "SUGGEST"]);
    refreshTokenUI();
  });

  ui.btnRevokeTokens.addEventListener("click", () => {
    revokeTokens();
    refreshTokenUI();
  });

  // Drag/drop visuals + ingest
  ui.dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  ui.dropzone.addEventListener("drop", async (e) => {
    e.preventDefault();
    if (!hasScope("INGEST")) return;
    const files = e.dataTransfer.files;
    await ingestBatch(files, ui.cmdInput.value);
  });

  ui.btnIngest.addEventListener("click", async () => {
    if (!hasScope("INGEST")) return;
    const files = ui.filePicker.files;
    await ingestBatch(files, ui.cmdInput.value);
    ui.filePicker.value = "";
  });

  // Export Tier-3 archive
  ui.btnExportTier3.addEventListener("click", () => {
    const archive = getArchive();
    downloadJSON(`OTOS_TIER3_ARCHIVE_${new Date().toISOString().slice(0,10)}.json`, archive);
  });

  // Clear local
  ui.btnClearLocal.addEventListener("click", () => {
    localStorage.removeItem(STATE_KEY);
    ui.highlightFeed.innerHTML = "";
    setStats({ state: "IDLE", processed: 0, queued: 0, last: null, ready: "Yes (idle)" });
  });

  // Restore feed from existing cache
  const archive = getArchive();
  if (archive.items.length) {
    archive.items.slice(-20).reverse().forEach(addFeedItem);
    setStats({
      state: "IDLE",
      processed: archive.items.length,
      queued: 0,
      last: archive.items[archive.items.length - 1].filename,
      ready: "Yes (idle)"
    });
  } else {
    setStats({ state: "IDLE", processed: 0, queued: 0, last: null, ready: "Yes (idle)" });
  }

  refreshTokenUI();
}

boot();
