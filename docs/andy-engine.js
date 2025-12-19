// FILE: docs/andy-engine.js
/* OTOS Andy Engine — Intake → Queue → Tier-3 Archive → (Optional) Notion Feeder
   Version: v1.1.0
   Delta:
   - Visible ingest progress bar (cannot be missed)
   - Explicit click → accept → processing confirmations
   - File input persistence until ingest completes
   - Hard UI pulses on Intake / Stats / Highlight
*/

(() => {
  "use strict";

  /* =========================
     CONFIG
     ========================= */
  const CFG = {
    STORAGE: {
      TOKENS: "otos_exec_tokens_v1",
      TIER3: "otos_tier3_archive_v1",
      NOTION_WEBHOOK: "otos_notion_webhook_v1",
    },
    UI: {
      MAX_HIGHLIGHTS: 14,
      MAX_ARCHIVE_ITEMS: 6000,
      MAX_FILE_BYTES_INLINE: 2_000_000,
    },
  };

  /* =========================
     STATE
     ========================= */
  const STATE = {
    tokens: { ingest: false, read: false, suggest: false },
    queue: [],
    processed: 0,
    queued: 0,
    ingesting: false,
    lastPulseAt: 0,
  };

  /* =========================
     UTILS
     ========================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const nowISO = () => new Date().toISOString();
  const uid = () => "i_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);

  const readJSON = (k, f) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; }
  };
  const writeJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  /* =========================
     CSS (pulse + progress)
     ========================= */
  function ensureCSS() {
    if ($("#otos-css")) return;
    const s = document.createElement("style");
    s.id = "otos-css";
    s.textContent = `
      .otos-pulse { animation: otosPulse 900ms ease-out 1; }
      @keyframes otosPulse {
        0%{box-shadow:0 0 0 0 rgba(59,130,246,.5)}
        70%{box-shadow:0 0 0 16px rgba(59,130,246,0)}
        100%{box-shadow:0 0 0 0 rgba(59,130,246,0)}
      }
      .otos-progress-wrap{margin-top:10px}
      .otos-progress{
        height:10px;border-radius:999px;
        background:rgba(15,23,42,.12);overflow:hidden
      }
      .otos-progress > i{
        display:block;height:100%;width:0%;
        background:linear-gradient(90deg,#3b82f6,#06b6d4);
        transition:width .25s ease
      }
      .otos-badge{font-size:12px;padding:2px 8px;border-radius:999px;background:#eef2ff}
    `;
    document.head.appendChild(s);
  }

  function pulse(el) {
    if (!el) return;
    el.classList.remove("otos-pulse"); void el.offsetWidth;
    el.classList.add("otos-pulse");
  }

  /* =========================
     CARD FINDERS
     ========================= */
  const cardByTitle = (t) =>
    $$("section,div").find(c => c.textContent?.trim().startsWith(t)) || null;

  const statsNodes = () => {
    const c = cardByTitle("Stats"); if (!c) return {};
    const ps = $$("*", c).find(n => n.textContent==="Processed")?.nextElementSibling;
    const qs = $$("*", c).find(n => n.textContent==="Queue")?.nextElementSibling;
    const ex = $$("button", c).find(b => b.textContent.includes("Export"));
    return { c, ps, qs, ex };
  };

  const intakeNodes = () => {
    const c = cardByTitle("Intake"); if (!c) return {};
    return {
      c,
      file: $("input[type=file]", c),
      cmd: $("input[placeholder*='Command']", c),
      btn: $$("button", c).find(b => b.textContent.includes("Ingest")),
    };
  };

  const highlightNodes = () => {
    const c = cardByTitle("Running Highlight Report"); if (!c) return {};
    let ul = $("ul", c);
    if (!ul) { ul = document.createElement("ul"); c.appendChild(ul); }
    return { c, ul };
  };

  /* =========================
     HIGHLIGHTS
     ========================= */
  function highlight(msg) {
    const { c, ul } = highlightNodes();
    if (!ul) return;
    const li = document.createElement("li");
    li.textContent = msg;
    ul.prepend(li);
    while (ul.children.length > CFG.UI.MAX_HIGHLIGHTS) ul.lastChild.remove();
    pulse(c);
  }

  /* =========================
     ARCHIVE
     ========================= */
  function pushArchive(item) {
    const a = readJSON(CFG.STORAGE.TIER3, { items: [] });
    a.items.unshift(item);
    if (a.items.length > CFG.UI.MAX_ARCHIVE_ITEMS) a.items.length = CFG.UI.MAX_ARCHIVE_ITEMS;
    writeJSON(CFG.STORAGE.TIER3, a);
  }

  function exportArchive() {
    const a = readJSON(CFG.STORAGE.TIER3, { items: [] });
    const blob = new Blob([JSON.stringify(a, null, 2)], { type:"application/json" });
    const l = document.createElement("a");
    l.href = URL.createObjectURL(blob);
    l.download = "otos-tier3-archive.json";
    l.click(); URL.revokeObjectURL(l.href);
    highlight("Tier-3 archive exported");
  }

  /* =========================
     PROGRESS BAR
     ========================= */
  function ensureProgress(card) {
    let wrap = $(".otos-progress-wrap", card);
    if (wrap) return wrap;
    wrap = document.createElement("div");
    wrap.className = "otos-progress-wrap";
    wrap.innerHTML = `<div class="otos-progress"><i></i></div>`;
    card.appendChild(wrap);
    return wrap;
  }
  function setProgress(card, pct) {
    const bar = ensureProgress(card).querySelector("i");
    bar.style.width = `${pct}%`;
    pulse(card);
  }

  /* =========================
     FILE READ
     ========================= */
  async function readFile(file) {
    const meta = { name:file.name,size:file.size,type:file.type,lastModified:file.lastModified };
    if (file.size <= CFG.UI.MAX_FILE_BYTES_INLINE && /text|json|md|txt|csv|js|ts|html|css/i.test(file.type+file.name))
      return { meta, text: await file.text() };
    return { meta, text: null };
  }

  /* =========================
     INGEST
     ========================= */
  async function ingest(files, cmd) {
    if (!STATE.tokens.ingest) { highlight("Blocked: no INGEST token"); return; }
    if (!files.length) { highlight("No files selected"); return; }

    const { c } = intakeNodes();
    STATE.ingesting = true;
    highlight(`Ingest started (${files.length} file${files.length>1?"s":""})`);
    setProgress(c, 5);

    STATE.queue = files.slice();
    STATE.queued = files.length;

    for (let i=0;i<files.length;i++) {
      const f = files[i];
      highlight(`Accepted: ${f.name}`);
      const read = await readFile(f);

      const record = {
        id: uid(),
        receivedAt: nowISO(),
        command: cmd,
        file: read.meta,
        inline: read.text,
      };

      pushArchive(record);
      STATE.processed += 1;
      STATE.queued -= 1;

      const pct = Math.round(((i+1)/files.length)*100);
      setProgress(c, pct);
      highlight(`Processed: ${f.name}`);
      await new Promise(r=>setTimeout(r,120));
    }

    STATE.ingesting = false;
    highlight("Ingest complete");
  }

  /* =========================
     TOKENS
     ========================= */
  function loadTokens() {
    const t = readJSON(CFG.STORAGE.TOKENS, null);
    if (t) STATE.tokens = t;
  }
  function bindTokens() {
    const c = cardByTitle("Execution Tokens"); if (!c) return;
    const issue = $$("button", c).find(b=>b.textContent.includes("Issue"));
    const revoke = $$("button", c).find(b=>b.textContent.includes("Revoke"));
    issue.onclick = ()=>{ STATE.tokens={ingest:true,read:true,suggest:true}; writeJSON(CFG.STORAGE.TOKENS,STATE.tokens); highlight("Tokens issued"); };
    revoke.onclick= ()=>{ STATE.tokens={ingest:false,read:false,suggest:false}; writeJSON(CFG.STORAGE.TOKENS,STATE.tokens); highlight("Tokens revoked"); };
  }

  /* =========================
     BIND UI
     ========================= */
  function bind() {
    const { c, file, cmd, btn } = intakeNodes();
    btn.onclick = async () => {
      if (STATE.ingesting) return;
      const files = file.files ? Array.from(file.files) : [];
      await ingest(files, cmd.value || "");
      // DO NOT clear file input automatically
    };

    const { ex } = statsNodes();
    if (ex) ex.onclick = exportArchive;
  }

  /* =========================
     BOOT
     ========================= */
  function boot() {
    ensureCSS();
    loadTokens();
    bindTokens();
    bind();
    highlight("Andy engine armed");
  }

  document.readyState==="loading"
    ? document.addEventListener("DOMContentLoaded", boot)
    : boot();

})();
