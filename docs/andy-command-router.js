// Andy Command Router
// Scope: intake-only, zero promotion, token-gated
// Matches EYE20 Andy Contract

(function () {
  const input = document.querySelector('[placeholder*="Command"]');
  const highlight = document.querySelector('.running-highlights');
  const stats = {
    processed: 0,
    queue: 0
  };

  if (!input) return;

  function log(msg) {
    if (!highlight) return;
    const line = document.createElement('div');
    line.className = 'highlight-line';
    line.textContent = msg;
    highlight.prepend(line);
  }

  function route(cmd) {
    switch (cmd.toUpperCase()) {
      case 'A':
        log('🔍 Analyse: extracting structure, themes, signal.');
        break;
      case 'G':
        log('✨ Golden scan: checking for reusable language.');
        break;
      case 'R':
        log('💰 Revenue lens: flagging monetisable insight.');
        break;
      case 'C':
        log('📘 Canon candidate: consistency + NHS-safe tone.');
        break;
      case 'T':
        log('⛔ Tasks & blockers detected.');
        break;
      case '?':
        log('ℹ️ Help: A Analyse | G Golden | R Revenue | C Canon | T Tasks');
        break;
      default:
        log('📥 Default ingest: archive-first, no mutation.');
    }
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = input.value.trim();
      input.value = '';
      route(cmd);
    }
  });

  log('Andy Command Router online.');
})();
