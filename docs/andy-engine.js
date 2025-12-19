/* =========================================================
   OTOS — ANDY ENGINE v1.2
   NOTION PUSH (LIVE-SAFE SIMULATION)
   Scope: Stage → Validate → Notion Payload → Send Stub
   No UI changes. No destructive ops.
   ========================================================= */

(() => {
  /* ---------- CONFIG ---------- */
  const NOTION = {
    enabled: false,               // 🔒 flip to true only in EYE21
    endpoint: "https://api.notion.com/v1/pages",
    databaseId: "NOTION_DATABASE_ID_HERE",
    version: "2022-06-28"
  };

  /* ---------- STATE ---------- */
  const STATE = {
    engine: "Andy v1.2",
    mode: "READY",
    sent: 0,
    failed: 0,
    lastError: null
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

  const getStagedPayload = () => {
    const raw = localStorage.getItem("OTOS_STAGED_DOCS");
    if (!raw) return [];
    try { return JSON.parse(raw); }
    catch { return []; }
  };

  const setStat = (label, value) => {
    const stats = cardByTitle("Stats");
    if (!stats) return;
    stats.querySelectorAll("*").forEach(n => {
      if (n.textContent?.startsWith(label)) {
        n.textContent = `${label}: ${value}`;
      }
    });
  };

  /* ---------- PAYLOAD BUILDER ---------- */
  const buildNotionPage = (doc) => ({
    parent: { database_id: NOTION.databaseId },
    properties: {
      Name: {
        title: [{ text: { content: doc.name } }]
      },
      Type: {
        select: { name: doc.type }
      },
      Size: {
        number: doc.size
      },
      StagedAt: {
        date: { start: doc.stagedAt }
      }
    },
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            { text: { content: doc.preview.slice(0, 2000) } }
          ]
        }
      }
    ]
  });

  /* ---------- EXECUTION ---------- */
  const staged = getStagedPayload();

  if (!staged.length) {
    highlight("No staged documents found");
    return;
  }

  highlight(`Preparing ${staged.length} document(s) for Notion`);

  staged.forEach((doc, idx) => {
    const payload = buildNotionPage(doc);

    if (!NOTION.enabled) {
      console.group(`Notion DRY-RUN → ${doc.name}`);
      console.log(payload);
      console.groupEnd();

      STATE.sent += 1;
      setStat("Processed", STATE.sent);
      highlight(`Dry-run OK: ${doc.name}`);
      return;
    }

    /* LIVE SEND (locked) */
    fetch(NOTION.endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${window.NOTION_TOKEN}`,
        "Notion-Version": NOTION.version,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(() => {
        STATE.sent += 1;
        setStat("Processed", STATE.sent);
        highlight(`Pushed to Notion: ${doc.name}`);
      })
      .catch(err => {
        STATE.failed += 1;
        STATE.lastError = err;
        highlight(`FAILED: ${doc.name}`);
      });
  });

  /* ---------- FINAL ---------- */
  highlight(`Andy v1.2 complete — ${STATE.sent} ready for Notion`);
  localStorage.setItem("OTOS_NOTION_READY", "true");

})();
