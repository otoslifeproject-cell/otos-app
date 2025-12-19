// FILE: docs/andy-notion-feeder.js
/* OTOS Andy → Notion Feeder Bridge
   Version: v1.0.0
   PURPOSE:
   - Takes Tier-3 Archive items
   - Pushes them into Notion Intake DB via webhook
   - Explicit status + retry-safe
   - No UI assumptions (engine-safe)

   WHERE THIS SITS:
   ✔ /docs (same level as andy-engine.js)
   ✔ Loaded AFTER andy-engine.js in index.html
*/

(() => {
  "use strict";

  /* =========================
     CONFIG
     ========================= */
  const CFG = {
    STORAGE: {
      TIER3: "otos_tier3_archive_v1",
      FEED_LOG: "otos_notion_feed_log_v1",
    },
    NOTION: {
      WEBHOOK_URL: null, // ← SET THIS
      BATCH_SIZE: 5,
    },
  };

  /* =========================
     STATE
     ========================= */
  const STATE = {
    feeding: false,
    sent: 0,
    failed: 0,
  };

  /* =========================
     UTILS
     ========================= */
  const readJSON = (k, f) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; }
  };
  const writeJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const nowISO = () => new Date().toISOString();

  /* =========================
     LOAD ARCHIVE
     ========================= */
  function getPendingItems() {
    const a = readJSON(CFG.STORAGE.TIER3, { items: [] });
    const log = readJSON(CFG.STORAGE.FEED_LOG, {});
    return a.items.filter(i => !log[i.id]);
  }

  /* =========================
     SEND TO NOTION
     ========================= */
  async function sendToNotion(item) {
    if (!CFG.NOTION.WEBHOOK_URL) throw new Error("No Notion webhook configured");

    const payload = {
      source: "OTOS / Andy",
      receivedAt: item.receivedAt,
      command: item.command,
      file: item.file,
      inline: item.inline,
      meta: {
        tier: 3,
        engine: "Andy v1",
      },
    };

    const res = await fetch(CFG.NOTION.WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Notion rejected payload");
  }

  /* =========================
     FEED LOOP
     ========================= */
  async function feedOnce() {
    if (STATE.feeding) return;
    STATE.feeding = true;

    const pending = getPendingItems().slice(0, CFG.NOTION.BATCH_SIZE);
    if (!pending.length) {
      STATE.feeding = false;
      return;
    }

    const log = readJSON(CFG.STORAGE.FEED_LOG, {});

    for (const item of pending) {
      try {
        await sendToNotion(item);
        log[item.id] = { sentAt: nowISO(), status: "ok" };
        STATE.sent += 1;
      } catch (e) {
        log[item.id] = { sentAt: nowISO(), status: "failed", error: e.message };
        STATE.failed += 1;
      }
      writeJSON(CFG.STORAGE.FEED_LOG, log);
      await new Promise(r=>setTimeout(r, 300));
    }

    STATE.feeding = false;
  }

  /* =========================
     PUBLIC HOOK
     ========================= */
  window.OTOS_FEED_NOTION = {
    run: feedOnce,
    stats: () => ({ sent: STATE.sent, failed: STATE.failed }),
  };

})();
