// FILE: nav-loader.js (FULL REPLACEMENT)

/*
  OTOS shared navigation loader
  Usage:
  <div id="nav"></div>
  <script src="nav-loader.js"></script>
*/

(function () {
  const navTarget = document.getElementById("nav");
  if (!navTarget) return;

  fetch("nav.html")
    .then(res => res.text())
    .then(html => {
      navTarget.innerHTML = html;
    })
    .catch(err => {
      console.error("Nav load failed", err);
    });
})();
