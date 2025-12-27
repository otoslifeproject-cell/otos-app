const stack = document.getElementById("actionStack");
const cards = Array.from(stack.children);

cards.forEach(card => {
  card.addEventListener("click", () => {
    // First click: bring to front
    cards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");

    // Reorder stack
    stack.prepend(card);

    // Second click: focus mode
    if (stack.classList.contains("focused")) {
      stack.classList.remove("focused");
    } else {
      stack.classList.add("focused");
    }
  });
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    stack.classList.remove("focused");
    cards.forEach(c => c.classList.remove("active"));
  }
});
