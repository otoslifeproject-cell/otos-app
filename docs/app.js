/* =========================================================
   OTOS Cockpit – Zone Focus & Fullscreen Engine
   ND-safe: explicit, reversible, no surprise behaviour
   ========================================================= */

(() => {
  const state = {
    focusedZone: null,
    moveMode: false,
  };

  const zones = document.querySelectorAll('[data-zone]');

  function clearFocus() {
    zones.forEach(z => {
      z.classList.remove('focused', 'dimmed');
    });
    state.focusedZone = null;
    document.body.classList.remove('zone-focused');
  }

  function focusZone(zone) {
    if (state.focusedZone === zone) {
      clearFocus();
      return;
    }

    state.focusedZone = zone;
    document.body.classList.add('zone-focused');

    zones.forEach(z => {
      if (z === zone) {
        z.classList.add('focused');
        z.classList.remove('dimmed');
      } else {
        z.classList.remove('focused');
        z.classList.add('dimmed');
      }
    });
  }

  function toggleMoveMode() {
    state.moveMode = !state.moveMode;
    document.body.classList.toggle('move-mode', state.moveMode);
  }

  // Click to focus (only when not in move mode)
  zones.forEach(zone => {
    zone.addEventListener('click', e => {
      if (state.moveMode) return;
      if (e.target.closest('.drag-handle')) return;
      focusZone(zone);
    });
  });

  // Global escape key clears focus
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      clearFocus();
    }
  });

  // Expose safe controls
  window.OTOS = {
    focusZoneById(id) {
      const zone = document.querySelector(`[data-zone="${id}"]`);
      if (zone) focusZone(zone);
    },
    clearFocus,
    toggleMoveMode,
    state,
  };
})();
