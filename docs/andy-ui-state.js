/**
 * andy-ui-state.js
 * ND-safe visual indicator for Andy execution state
 *
 * Purpose:
 * - Show clearly whether Andy is ARMED or DISARMED
 * - Reflect real token state only (no fake UI state)
 * - Calm, readable, non-distracting
 */

(() => {
  // -------------------------------
  // Utilities
  // -------------------------------
  function ensureIndicator() {
    let el = document.getElementById("andy-state-indicator");
    if (el) return el;

    el = document.createElement("div");
    el.id = "andy-state-indicator";
    el.style.position = "fixed";
    el.style.bottom = "16px";
    el.style.right = "16px";
    el.style.padding = "10px 14px";
    el.style.borderRadius = "8px";
    el.style.fontSize = "14px";
    el.style.fontWeight = "500";
    el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)";
    el.style.zIndex = "9999";
    el.style.transition = "background 0.2s ease";

    document.body.appendChild(el);
    return el;
  }

  function render() {
    const el = ensureIndicator();

    if (!window.ANDY_TOKEN || !window.ANDY_TOKEN.canExecute()) {
      el.textContent = "Andy idle · no authorisation";
      el.style.background = "#f1f5f9";
      el.style.color = "#334155";
      el.style.border = "1px solid #cbd5e1";
      return;
    }

    el.textContent = "Andy armed · 1 action permitted";
    el.style.background = "#ecfdf5";
    el.style.color = "#065f46";
    el.style.border = "1px solid #6ee7b7";
  }

  // -------------------------------
  // Watch token changes
  // -------------------------------
  setInterval(render, 300);

  // -------------------------------
  // Boot
  // -------------------------------
  render();
})();
