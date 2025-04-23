import { setRandomNeonAccent } from './random-theme-color.js'; // Import the function

document.addEventListener('DOMContentLoaded', () => {
  // Navbar theme toggle script
  const navbarToggle = document.getElementById("navbar-theme-toggle");
  const ICON_LIGHT_NAV = '☀'; // switch to dark (Crescent Moon U+263E)
  const ICON_DARK_NAV = '☾'; // switch to light (Sun U+2600)

  if (navbarToggle) {
    navbarToggle.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent default anchor behavior
      const current = document.body.dataset.theme;
      const next = current === "light" ? "dark" : "light";
      document.body.dataset.theme = next;
      navbarToggle.textContent = next === 'light' ? ICON_DARK_NAV : ICON_LIGHT_NAV;
      localStorage.setItem("theme", next);
      setRandomNeonAccent(); // Call after setting theme
    });

    // Initialize theme based on localStorage
    const saved = localStorage.getItem("theme") || "light";
    // Set initial icon based on saved theme
    // Ensure body dataset is set before reading it for icon
    document.body.dataset.theme = saved; 
    navbarToggle.textContent = saved === 'light' ? ICON_LIGHT_NAV : ICON_DARK_NAV;
    // Apply initial accent color based on theme
    setRandomNeonAccent(); 

  } else {
    console.warn('Navbar theme toggle element not found');
  }
});
