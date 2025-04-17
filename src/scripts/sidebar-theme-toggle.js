// Sidebar theme toggle script
const themeToggle = document.getElementById("theme-toggle");
const ICON_LIGHT = '◒'; // switch to light
const ICON_DARK = '◓'; // switch to dark

themeToggle.addEventListener("click", () => {
  const current = document.body.dataset.theme;
  const next = current === "light" ? "dark" : "light";
  document.body.dataset.theme = next;
  themeToggle.textContent = next === 'light' ? ICON_DARK : ICON_LIGHT;
  localStorage.setItem("theme", next);
});

// Initialize theme based on localStorage
const saved = localStorage.getItem("theme") || "light";
document.body.dataset.theme = saved;
themeToggle.textContent = saved === 'light' ? ICON_DARK : ICON_LIGHT;