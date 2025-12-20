/* ============================================================
   UI INTAKE HOOK v1
   ------------------------------------------------------------
   Purpose:
   - Wire UI controls to window.ANDY (tokens + ingest)
   - Robust selectors with safe fallbacks (no brittle IDs)
   - Update “Running Highlight Report” from intake events
   ============================================================ */

(function () {
  function $(sel, root = document) {
    return root.querySelector(sel);
  }
  function $all(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function findButtonByText(textIncludes) {
    const btns = $all("button");
    const needle = String(textIncludes).toLowerCase();
    return btns.find(b => (b.textContent || "").toLowerCase().includes(needle));
  }

  function findIntakeCard() {
    // Prefer a labelled intake card if present
    const cards = $all(".card");
    const intake = cards.find(c => (c.textContent || "").toLowerCase().includes("intake"));
    return intake || document;
  }

  function ensureAndy() {
    if (!window.ANDY) {
      console.warn("[UI] window.ANDY not found. Ensure docs/andy-intake.js is loaded BEFORE this file.");
      return false;
    }
    return true;
  }

  function setHighlight(msg) {
    const el =
      $("[data-andy-highlight]") ||
      $("[data-highlight]") ||
      findHighlightCardValue() ||
      null;

    if (!el) return;

    el.textContent = msg;
  }

  function findHighlightCardValue() {
    // Looks for a card containing “Running Highlight Report”
    const cards = $all(".card");
    const card = cards.find(c => (c.textContent || "").toLowerCase().includes("running highlight"));
    if (!card) return null;

    // Prefer .value element, else first paragraph/div after title
    return $(".value", card) || $("p", card) || $("div", card);
  }

  function bind() {
    if (!ensureAndy()) return;

    const intakeRoot = findIntakeCard();

    // File input
    const fileInput =
      $("[data-andy-file]", intakeRoot) ||
      $("input[type='file']", intakeRoot) ||
      $("input[type='file']");

    // Command input (text)
    const commandInput =
      $("[data-andy-command]", intakeRoot) ||
      $("input[type='text']", intakeRoot) ||
      $("input[placeholder*='Command']", intakeRoot) ||
      $("input[placeholder*='Command']");

    // Buttons
    const ingestBtn =
      $("[data-andy-ingest]", intakeRoot) ||
      findButtonByText("ingest batch") ||
      findButtonByText("ingest");

    const issueBtn =
      $("[data-andy-issue]", document) ||
      findButtonByText("issue token") ||
      findButtonByText("issue");

    const revokeBtn =
      $("[data-andy-revoke]", document) ||
      findButtonByText("revoke");

    // Hook: tokens
    if (issueBtn) {
      issueBtn.addEventListener("click", () => {
        window.ANDY.issueTokens();
        setHighlight("Tokens issued • Andy ready");
      });
    }

    if (revokeBtn) {
      revokeBtn.addEventListener("click", () => {
        window.ANDY.revokeTokens();
        setHighlight("Tokens revoked • Andy idle");
      });
    }

    // Hook: ingest
    if (ingestBtn) {
      ingestBtn.addEventListener("click", () => {
        const files = fileInput?.files;
        const cmd = commandInput?.value || "";
        setHighlight("Ingesting… (token-gated)");
        window.ANDY.ingestBatch(files, cmd);
      });
    }

    // Live highlight updates from intake events
    document.addEventListener("andy:intake", (e) => {
      const d = e.detail || {};
      const cmds = Array.isArray(d.commands) ? d.commands.join(", ") : "";
      setHighlight(`Ingested: ${d.name}${cmds ? " • " + cmds : ""}`);
    });

    // First state
    setHighlight("Andy engine ready (idle)");

    console.log("[UI] Intake hook bound:", {
      fileInput: !!fileInput,
      commandInput: !!commandInput,
      ingestBtn: !!ingestBtn,
      issueBtn: !!issueBtn,
      revokeBtn: !!revokeBtn,
    });
  }

  // Wait until DOM is ready (GitHub Pages sometimes delays layout)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
