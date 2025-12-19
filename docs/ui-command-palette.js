/* =========================================================
   OTOS — UI CORE v1.2
   COMMAND PALETTE (KEYBOARD → ANDY)
   Purpose: Fast commands (A/G/R/C/T) + visibility of execution
   Location: otos-app/docs/ui-command-palette.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (window.OTOS_COMMAND_PALETTE_ACTIVE) return;
  window.OTOS_COMMAND_PALETTE_ACTIVE = true;

  /* ---------- STATE ---------- */
  let open = false;

  /* ---------- UI ---------- */
  const palette = document.createElement("div");
  palette.style.position = "fixed";
  palette.style.top = "50%";
  palette.style.left = "50%";
  palette.style.transform = "translate(-50%, -50%)";
  palette.style.padding = "22px";
  palette.style.borderRadius = "16px";
  palette.style.background = "linear-gradient(180deg,#020617,#0f172a)";
  palette.style.color = "white";
  palette.style.boxShadow = "0 30px 60px rgba(0,0,0,.35)";
  palette.style.display = "none";
  palette.style.zIndex = "9999";
  palette.style.minWidth = "320px";

  const title = document.createElement("div");
  title.textContent = "Command Palette";
  title.style.fontSize = "18px";
  title.style.marginBottom = "10px";
  title.style.opacity = "0.8";

  const hint = document.createElement("div");
  hint.textContent = "A = Analyse · G = Golden · R = Revenue · C = Canon · T = Task";
  hint.style.fontSize = "13px";
  hint.style.opacity = "0.6";
  hint.style.marginBottom = "14px";

  const status = document.createElement("div");
  status.textContent = "Awaiting command…";
  status.style.fontSize = "14px";
  status.style.opacity = "0.9";

  palette.appendChild(title);
  palette.appendChild(hint);
  palette.appendChild(status);
  document.body.appendChild(palette);

  /* ---------- HELPERS ---------- */
  const show = () => {
    palette.style.display = "block";
    open = true;
  };

  const hide = () => {
    palette.style.display = "none";
    open = false;
  };

  const emit = (cmd) => {
    status.textContent = `Command sent: ${cmd}`;
    localStorage.setItem("OTOS_LAST_COMMAND", cmd);
    setTimeout(hide, 600);
  };

  /* ---------- KEY BINDINGS ---------- */
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !open) {
      e.preventDefault();
      show();
      return;
    }

    if (!open) return;

    const key = e.key.toUpperCase();
    if (["A","G","R","C","T"].includes(key)) {
      emit(key);
    }

    if (e.key === "Escape") {
      hide();
    }
  });

})();
