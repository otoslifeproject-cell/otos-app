/* =========================================================
   OTOS — ANDY ENGINE v1.5
   AUDIT + ERROR LOGGING LAYER
   Scope: Persist every action, error, decision
   Target: Notion Errors / Audit DB (dry-run safe)
   ========================================================= */

(() => {

  /* ---------- CONFIG ---------- */
  const AUDIT = {
    enabled: false,                 // 🔒 TRUE only in EYE21 Parent
    notionEndpoint: "https://api.notion.com/v1/pages",
    databaseId: "NOTION_DB_AUDIT_ID",
    version: "2022-06-28"
  };

  /* ---------- STATE ---------- */
  const STATE = {
    engine: "Andy v1.5",
    sessionId: crypto.randomUUID(),
    events: []
  };

  /* ---------- HELPERS ---------- */
  const cardByTitle = (title) =>
    Array.from(document.querySelectorAll("div"))
      .find(d => d.textContent?.trim().startsWith(title));

  const highlight = (msg) => {
    const report = cardByTitle("Running Highlight Report");
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  const logEvent = (type, detail) => {
    const event = {
      session: STATE.sessionId,
      engine: STATE.engine,
      type,
      detail,
      timestamp: new Date().toISOString()
    };
    STATE.events.push(event);
    localStorage.setItem(
      "OTOS_AUDIT_EVENTS",
      JSON.stringify(STATE.events, null, 2)
    );
    highlight(`AUDIT: ${type}`);
  };

  const buildAuditPage = (event) => ({
    parent: { database_id: AUDIT.databaseId },
    properties: {
      Name: {
        title: [{ text: { content: `${event.type}` } }]
      },
      Session: {
        rich_text: [{ text: { content: event.session } }]
      },
      Engine: {
        select: { name: event.engine }
      },
      Timestamp: {
        date: { start: event.timestamp }
      }
    },
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            { text: { content: JSON.stringify(event.detail, null, 2) } }
          ]
        }
      }
    ]
  });

  /* ---------- HOOK INTO PREVIOUS STATE ---------- */
  const existing = localStorage.getItem("OTOS_AUDIT_EVENTS");
  if (existing) {
    try { STATE.events = JSON.parse(existing); }
    catch { STATE.events = []; }
  }

  /* ---------- GLOBAL ERROR CAPTURE ---------- */
  window.addEventListener("error", (e) => {
    logEvent("JS_ERROR", {
      message: e.message,
      source: e.filename,
      line: e.lineno
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    logEvent("PROMISE_REJECTION", {
      reason: e.reason
    });
  });

  /* ---------- OPTIONAL NOTION PUSH ---------- */
  if (AUDIT.enabled && STATE.events.length) {
    STATE.events.forEach(ev => {
      const payload = buildAuditPage(ev);

      fetch(AUDIT.notionEndpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${window.NOTION_TOKEN}`,
          "Notion-Version": AUDIT.version,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(() => {
        highlight(`Audit pushed: ${ev.type}`);
      })
      .catch(err => {
        console.error("Audit push failed", err);
      });
    });
  }

  /* ---------- BOOT ---------- */
  logEvent("ENGINE_START", {
    note: "Audit + error layer active"
  });

})();
