// FILE: docs/andy-engine.js
/* OTOS Andy Engine — Intake → Queue → (Optional) Notion Feeder via Webhook
   Version: v1.0.0
   Notes:
   - GitHub Pages safe (no secrets).
   - Notion write is via webhook/proxy ONLY (CORS-safe). Set in UI/localStorage.
*/

(() => {
  "use strict";

  /* =========================
     CONFIG (no secrets here)
     ========================= */
  const CFG = {
    STORAGE: {
      TOKENS: "otos_exec_tokens_v1",
      TIER3: "otos_tier3_archive_v1",
      NOTION_WEBHOOK: "otos_notion_webhook_v1", // user sets (Zapier/Make/Cloudflare Worker/etc.)
    },
    UI: {
      MAX_HIGHLIGHTS: 12,
      MAX_ARCHIVE_ITEMS: 5000,
      MAX_FILE_BYTES_INLINE: 2_000_000, // store small text inline, otherwise metadata only
    },
  };

  /* =========================
     STATE
     ========================= */
  const STATE = {
    tokens: {
      ingest: false,
      read: false,
      suggest: false,
    },
    queue: [],
    processed: 0,
    queued: 0,
    lastPulseAt: 0,
  };

  /* =========================
     HELPERS
     ========================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function safeText(el) {
    return (el?.textContent || "").trim();
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function uid() {
    return (
      "i_" +
      Math.random().toString(16).slice(2) +
      "_" +
      Date.now().toString(16)
    );
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function setTokens(tokens) {
    STATE.tokens = { ...STATE.tokens, ...tokens };
    writeJSON(CFG.STORAGE.TOKENS, STATE.tokens);
    renderTokens();
  }

  function loadTokens() {
    const t = readJSON(CFG.STORAGE.TOKENS, null);
    if (t && typeof t === "object") STATE.tokens = { ...STATE.tokens, ...t };
  }

  function getWebhook() {
    return (localStorage.getItem(CFG.STORAGE.NOTION_WEBHOOK) || "").trim();
  }

  function setWebhook(url) {
    localStorage.setItem(CFG.STORAGE.NOTION_WEBHOOK, (url || "").trim());
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  /* =========================
     UI LOCATORS (robust)
     ========================= */
  function cardByTitle(title) {
    const cards = $$("section, .card, .panel, .glass, [data-card], div");
    // Heuristic: find a container whose first heading matches title
    for (const c of cards) {
      const h =
        $("h1,h2,h3,h4,strong,.title", c) ||
        $$("div,span,p", c).find((n) => safeText(n) === title);
      if (h && safeText(h) === title) return c;
    }
    // fallback by text scan
    return cards.find((c) => safeText(c).includes(title)) || null;
  }

  function findButtonByText(root, textIncludes) {
    const btns = $$("button,input[type='button'],input[type='submit']", root);
    return (
      btns.find((b) => safeText(b).includes(textIncludes)) ||
      btns.find((b) => (b.value || "").includes(textIncludes)) ||
      null
    );
  }

  function findInputByPlaceholder(root, placeholderIncludes) {
    const ins = $$("input,textarea", root);
    return ins.find((i) => (i.placeholder || "").includes(placeholderIncludes)) || null;
  }

  function findFileInput(root) {
    return $("input[type='file']", root);
  }

  function statsNodes() {
    const statsCard = cardByTitle("Stats");
    if (!statsCard) return {};
    const nodes = $$("*", statsCard);

    const processedLabel = nodes.find((n) => safeText(n) === "Processed");
    const queueLabel = nodes.find((n) => safeText(n) === "Queue");

    function valueNodeAfter(labelNode) {
      if (!labelNode) return null;
      // try next sibling
      if (labelNode.nextElementSibling) return labelNode.nextElementSibling;
      // try within same row: nearest parent then last child number
      const row = labelNode.closest("div,li,p") || labelNode.parentElement;
      if (!row) return null;
      const candidates = $$("strong,span,div", row).filter((n) => /\d+/.test(safeText(n)));
      return candidates[candidates.length - 1] || null;
    }

    const processedVal = valueNodeAfter(processedLabel);
    const queueVal = valueNodeAfter(queueLabel);

    const exportBtn = findButtonByText(statsCard, "Export");

    return { statsCard, processedVal, queueVal, exportBtn };
  }

  function highlightNodes() {
    const card = cardByTitle("Running Highlight Report");
    if (!card) return {};
    let list = $("ul", card);
    if (!list) {
      list = document.createElement("ul");
      list.style.margin = "10px 0 0";
      list.style.paddingLeft = "18px";
      card.appendChild(list);
    }
    return { card, list };
  }

  function intakeNodes() {
    const card = cardByTitle("Intake");
    if (!card) return {};
    const file = findFileInput(card);
    const cmd = findInputByPlaceholder(card, "Command:");
    const ingestBtn = findButtonByText(card, "Ingest");
    return { card, file, cmd, ingestBtn };
  }

  function tokensNodes() {
    const card = cardByTitle("Execution Tokens");
    if (!card) return {};
    const issueBtn = findButtonByText(card, "Issue token");
    const revokeBtn = findButtonByText(card, "Revoke");
    return { card, issueBtn, revokeBtn };
  }

  /* =========================
     VISUAL PULSE
     ========================= */
  function ensurePulseCSS() {
    if ($("#otos-pulse-css")) return;
    const style = document.createElement("style");
    style.id = "otos-pulse-css";
    style.textContent = `
      .otos-pulse {
        animation: otosPulse 900ms ease-out 1;
        box-shadow: 0 0 0 0 rgba(59,130,246,.45);
      }
      @keyframes otosPulse {
        0%   { box-shadow: 0 0 0 0 rgba(59,130,246,.45); }
        70%  { box-shadow: 0 0 0 14px rgba(59,130,246,0); }
        100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
      }
      .otos-muted { opacity:.75; }
      .otos-badge {
        display:inline-block;
        font-size:12px;
        padding:3px 8px;
        border-radius:999px;
        background:rgba(15,23,42,.06);
        margin-left:8px;
      }
      .otos-row {
        display:flex;
        gap:10px;
        align-items:center;
        flex-wrap:wrap;
        margin-top:10px;
      }
      .otos-input {
        padding:8px 10px;
        border:1px solid rgba(15,23,42,.12);
        border-radius:10px;
        min-width:320px;
      }
      .otos-btn {
        padding:8px 10px;
        border:1px solid rgba(15,23,42,.12);
        border-radius:10px;
        background:white;
        cursor:pointer;
      }
    `;
    document.head.appendChild(style);
  }

  function pulse(el) {
    if (!el) return;
    const t = Date.now();
    // prevent rapid flicker
    if (t - STATE.lastPulseAt < 200) return;
    STATE.lastPulseAt = t;

    el.classList.remove("otos-pulse");
    // force reflow
    void el.offsetWidth;
    el.classList.add("otos-pulse");
    setTimeout(() => el.classList.remove("otos-pulse"), 1000);
  }

  /* =========================
     HIGHLIGHT LOG
     ========================= */
  function highlight(msg) {
    const { list, card } = highlightNodes();
    if (!list) return;
    const li = document.createElement("li");
    li.textContent = msg;
    list.prepend(li);
    while (list.children.length > CFG.UI.MAX_HIGHLIGHTS) {
      list.removeChild(list.lastElementChild);
    }
    pulse(card);
  }

  /* =========================
     ARCHIVE (Tier-3)
     ========================= */
  function loadArchive() {
    const a = readJSON(CFG.STORAGE.TIER3, { items: [] });
    if (!a.items || !Array.isArray(a.items)) return { items: [] };
    return a;
  }

  function pushArchiveItem(item) {
    const archive = loadArchive();
    archive.items.unshift(item);
    if (archive.items.length > CFG.UI.MAX_ARCHIVE_ITEMS) {
      archive.items.length = CFG.UI.MAX_ARCHIVE_ITEMS;
    }
    writeJSON(CFG.STORAGE.TIER3, archive);
  }

  function exportArchive() {
    const archive = loadArchive();
    const blob = new Blob([JSON.stringify({
      exportedAt: nowISO(),
      engine: "Andy v1.0.0",
      processed: STATE.processed,
      queued: STATE.queued,
      items: archive.items
    }, null, 2)], { type: "application/json" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "otos-tier3-archive.json";
    a.click();
    URL.revokeObjectURL(a.href);
    highlight("Exported Tier-3 archive (JSON)");
  }

  /* =========================
     COMMAND ROUTING
     ========================= */
  function parseCommand(raw) {
    const s = (raw || "").trim();
    if (!s) return { mode: "A", raw: "" };
    const head = s.split(/\s+/)[0].toUpperCase();
    const mode = ["A", "G", "R", "C", "T", "?", "I"].includes(head) ? head : "A";
    return { mode, raw: s };
  }

  function inferTags(mode) {
    switch (mode) {
      case "G": return ["golden", "statement"];
      case "R": return ["revenue", "opportunity"];
      case "C": return ["canon", "core"];
      case "T": return ["tasks", "actions"];
      case "?": return ["notable", "flag"];
      case "I": return ["intake", "ingest"];
      case "A":
      default: return ["analyse"];
    }
  }

  /* =========================
     NOTION FEEDER (webhook)
     ========================= */
  async function sendToNotionFeeder(payload) {
    const webhook = getWebhook();
    if (!webhook) {
      return { ok: false, skipped: true, reason: "NO_WEBHOOK" };
    }
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { ok: false, skipped: false, status: res.status, body: text };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, skipped: false, error: String(e) };
    }
  }

  /* =========================
     INTAKE → QUEUE → PROCESS
     ========================= */
  async function readFileMaybeInline(file) {
    const meta = {
      name: file.name,
      size: file.size,
      type: file.type || "",
      lastModified: file.lastModified || null,
    };

    // For small-ish text files, store text inline
    const isText =
      (file.type && file.type.startsWith("text/")) ||
      /\.(txt|md|json|csv|log|yaml|yml|html|js|ts|css)$/i.test(file.name);

    if (isText && file.size <= CFG.UI.MAX_FILE_BYTES_INLINE) {
      const text = await file.text();
      return { meta, inline: { text } };
    }

    // For JSON under cap, store parsed too
    if (/\.json$/i.test(file.name) && file.size <= CFG.UI.MAX_FILE_BYTES_INLINE) {
      const text = await file.text();
      try {
        const json = JSON.parse(text);
        return { meta, inline: { text, json } };
      } catch {
        return { meta, inline: { text } };
      }
    }

    return { meta, inline: null };
  }

  function updateStatsUI() {
    const { processedVal, queueVal, statsCard } = statsNodes();
    if (processedVal) processedVal.textContent = String(STATE.processed);
    if (queueVal) queueVal.textContent = String(STATE.queued);
    pulse(statsCard);
  }

  function setTopStatus(text) {
    // top-right status exists in header; best-effort: find an element containing "System idle"
    const nodes = $$("*");
    const status = nodes.find((n) => safeText(n).includes("System idle")) ||
                   nodes.find((n) => safeText(n).includes("System"));
    if (status) status.textContent = text;
  }

  function ensureWebhookUI() {
    const intake = intakeNodes();
    if (!intake.card) return;

    // Avoid duplicates
    if ($("#otos-webhook-row", intake.card)) return;

    const row = document.createElement("div");
    row.id = "otos-webhook-row";
    row.className = "otos-row";

    const label = document.createElement("div");
    label.innerHTML = `<span class="otos-muted">Notion Feeder Webhook</span><span class="otos-badge">optional</span>`;

    const input = document.createElement("input");
    input.className = "otos-input";
    input.type = "url";
    input.placeholder = "Paste webhook URL (Zapier/Make/Worker) …";
    input.value = getWebhook();

    const save = document.createElement("button");
    save.className = "otos-btn";
    save.textContent = "Save";

    const clear = document.createElement("button");
    clear.className = "otos-btn";
    clear.textContent = "Clear";

    save.onclick = () => {
      setWebhook(input.value);
      highlight(getWebhook() ? "Webhook saved" : "Webhook cleared");
    };

    clear.onclick = () => {
      input.value = "";
      setWebhook("");
      highlight("Webhook cleared");
    };

    row.appendChild(label);
    row.appendChild(input);
    row.appendChild(save);
    row.appendChild(clear);

    intake.card.appendChild(row);
  }

  async function ingestFiles(files, commandRaw) {
    if (!STATE.tokens.ingest) {
      highlight("Blocked: no execution tokens (INGEST required)");
      return;
    }

    const cmd = parseCommand(commandRaw);
    const tags = inferTags(cmd.mode);

    if (!files || files.length === 0) {
      highlight("Ingest: no files selected");
      return;
    }

    setTopStatus("System active · ingesting…");
    const { statsCard } = statsNodes();

    // Add to queue immediately
    for (const f of files) {
      const qItem = {
        id: uid(),
        createdAt: nowISO(),
        command: cmd,
        tags,
        fileMeta: { name: f.name, size: f.size, type: f.type || "", lastModified: f.lastModified || null },
        status: "queued",
      };
      STATE.queue.push({ qItem, file: f });
    }
    STATE.queued = STATE.queue.length;
    updateStatsUI();
    highlight(`Queued ${files.length} file(s) (${cmd.mode})`);
    pulse(statsCard);

    // Process sequentially (predictable + safer)
    while (STATE.queue.length) {
      const { qItem, file } = STATE.queue.shift();
      STATE.queued = STATE.queue.length;
      updateStatsUI();

      qItem.status = "processing";
      highlight(`Processing: ${qItem.fileMeta.name}`);

      const read = await readFileMaybeInline(file);

      // Minimal extraction (place-holder for richer extractor later)
      const extraction = {
        mode: cmd.mode,
        tags,
        hints: cmd.raw ? [cmd.raw] : [],
        // For now: very small heuristic summary if inline text exists
        summary:
          read.inline?.text
            ? read.inline.text.slice(0, 500).trim()
            : "(binary/large file — stored as metadata only)",
      };

      // Persist Tier-3
      const archived = {
        id: qItem.id,
        createdAt: qItem.createdAt,
        receivedAt: nowISO(),
        command: qItem.command,
        tags: qItem.tags,
        file: read.meta,
        inline: read.inline ? { text: read.inline.text, json: read.inline.json } : null,
        extraction,
        delivery: { notion: null },
      };

      // Attempt Notion Feeder via webhook
      const deliveryPayload = {
        type: "OTOS_FEEDER_INGEST_V1",
        createdAt: archived.createdAt,
        receivedAt: archived.receivedAt,
        command: archived.command,
        tags: archived.tags,
        file: archived.file,
        inline: archived.inline ? { text: archived.inline.text, json: archived.inline.json } : null,
        extraction: archived.extraction,
      };

      const notionRes = await sendToNotionFeeder(deliveryPayload);
      archived.delivery.notion = notionRes;

      pushArchiveItem(archived);

      // Update counters
      STATE.processed += 1;
      updateStatsUI();

      if (notionRes.ok) {
        highlight(`✅ Sent to Notion Feeder: ${archived.file.name}`);
      } else if (notionRes.skipped) {
        highlight(`Saved locally (no webhook): ${archived.file.name}`);
      } else {
        highlight(`⚠️ Notion send failed (${notionRes.status || "ERR"}): saved locally`);
      }

      await sleep(120); // subtle pacing; keeps UI responsive
    }

    setTopStatus("System idle · no execution tokens issued");
    highlight("Ingest complete");
  }

  /* =========================
     TOKENS UI
     ========================= */
  function renderTokens() {
    // No fancy UI changes; just keep state consistent.
    // If you later add visual toggles, wire them here.
  }

  function bindTokensUI() {
    const { issueBtn, revokeBtn } = tokensNodes();
    if (issueBtn) {
      issueBtn.onclick = () => {
        setTokens({ ingest: true, read: true, suggest: true });
        highlight("Tokens issued: INGEST + READ + SUGGEST");
      };
    }
    if (revokeBtn) {
      revokeBtn.onclick = () => {
        setTokens({ ingest: false, read: false, suggest: false });
        highlight("Tokens revoked");
      };
    }
  }

  /* =========================
     BIND UI
     ========================= */
  function bindExport() {
    const { exportBtn } = statsNodes();
    if (exportBtn) exportBtn.onclick = exportArchive;
  }

  function bindIntake() {
    const { file, cmd, ingestBtn } = intakeNodes();
    if (!ingestBtn) return;

    ingestBtn.onclick = async () => {
      const files = file?.files ? Array.from(file.files) : [];
      const commandRaw = cmd?.value || "";
      await ingestFiles(files, commandRaw);
      // Do NOT clear file input on success; user decides. (refresh clears naturally)
    };
  }

  function boot() {
    ensurePulseCSS();
    loadTokens();
    bindTokensUI();
    bindExport();
    bindIntake();
    ensureWebhookUI();
    highlight("Andy engine ready (idle)");
    updateStatsUI();
  }

  // Boot once DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
