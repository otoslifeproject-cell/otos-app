/**
 * UI REGISTRY LOADER
 * Reads UI Control Registry export and renders modules
 */

window.UIRegistry = {
  modules: [
    "One Action",
    "Projects",
    "Tasks",
    "Reality Radar",
    "System State",
    "Notes"
  ]
};

function renderModules() {
  const core = document.querySelector(".lane.core");
  if (!core) return;

  // Remove static placeholders except One Action
  [...core.children].forEach(el => {
    if (!el.classList.contains("action-card")) {
      el.remove();
    }
  });

  UIRegistry.modules.forEach(name => {
    if (name === "One Action") return;

    const card = document.createElement("div");
    card.className = "card module";
    card.dataset.module = name;

    card.innerHTML = `
      <h3>${name}</h3>
      <p class="muted">Registry module</p>
    `;

    card.draggable = true;
    enableDrag(card);
    core.appendChild(card);
  });
}

/* --- Drag handling --- */
function enableDrag(el) {
  el.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", el.dataset.module);
    el.classList.add("dragging");
  });

  el.addEventListener("dragend", () => {
    el.classList.remove("dragging");
  });
}

document.addEventListener("DOMContentLoaded", renderModules);
