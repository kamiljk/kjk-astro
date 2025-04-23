import { setRandomNeonAccent } from './random-theme-color.js'; // Import the function

// Sidebar theme toggle script
const themeToggle = document.getElementById("theme-toggle");
const ICON_LIGHT = '☀'; // switch to dark (Crescent Moon U+263E)
const ICON_DARK = '☾'; // switch to light (Sun U+2600)

themeToggle.addEventListener("click", () => {
  const current = document.body.dataset.theme;
  const next = current === "light" ? "dark" : "light";
  document.body.dataset.theme = next;
  // If the next theme is light (currently dark), show ICON_DARK (Sun)
  // If the next theme is dark (currently light), show ICON_LIGHT (Moon)
  themeToggle.textContent = next === 'light' ? ICON_DARK : ICON_LIGHT;
  localStorage.setItem("theme", next);
  setRandomNeonAccent(); // Call after setting theme
});

// Initialize theme based on localStorage
const saved = localStorage.getItem("theme") || "light";
document.body.dataset.theme = saved;
// If the saved theme is light, show ICON_LIGHT (Moon)
// If the saved theme is dark, show ICON_DARK (Sun)
themeToggle.textContent = saved === 'light' ? ICON_LIGHT : ICON_DARK;
setRandomNeonAccent(); // Call after setting initial theme