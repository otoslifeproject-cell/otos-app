/**
 * andy-token.js
 * Parent-issued execution token
 *
 * HARD RULES:
 * - Tokens are explicit
 * - Tokens are single-use (unless reissued)
 * - Andy cannot self-authorise
 * - Parent is the only authority
 */

(() => {
  const TOKEN_STATE = {
    active: false,
    issuedAt: null,
    used: false
  };

  function log(msg) {
    console.log(`[PARENT][TOKEN] ${msg}`);
  }

  // -------------------------------
  // Token API (EXPORTED)
  // -------------------------------
  window.ANDY_TOKEN = {
    issue(reason = "manual") {
      TOKEN_STATE.active = true;
      TOKEN_STATE.used = false;
      TOKEN_STATE.issuedAt = Date.now();
      log(`Token issued (${reason})`);
      return true;
    },

    revoke() {
      TOKEN_STATE.active = false;
      TOKEN_STATE.used = false;
      TOKEN_STATE.issuedAt = null;
      log("Token revoked");
      return true;
    },

    canExecute() {
      if (!TOKEN_STATE.active) return false;
      if (TOKEN_STATE.used) return false;
      return true;
    },

    consume() {
      if (!this.canExecute()) {
        log("Execution blocked (no valid token)");
        return false;
      }
      TOKEN_STATE.used = true;
      log("Token consumed");
      return true;
    },

    status() {
      return {
        active: TOKEN_STATE.active,
        used: TOKEN_STATE.used,
        issuedAt: TOKEN_STATE.issuedAt
      };
    }
  };

  // -------------------------------
  // Wire UI Buttons (if present)
  // -------------------------------
  const issueBtn = document.getElementById("issue-token-btn");
  const revokeBtn = document.getElementById("revoke-token-btn");

  if (issueBtn) {
    issueBtn.addEventListener("click", () => {
      window.ANDY_TOKEN.issue("UI");
    });
  }

  if (revokeBtn) {
    revokeBtn.addEventListener("click", () => {
      window.ANDY_TOKEN.revoke();
    });
  }

  log("Token authority ready (idle)");
})();
