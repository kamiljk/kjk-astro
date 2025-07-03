/**
 * Theme initialization script
 * This script runs before other scripts to ensure proper theme initialization
 */

/* THEME INIT SCRIPT DISABLED - handled by React ThemeToggle component
(function() {
  // Ensure theme is applied immediately before any rendering occurs
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem("theme");
  const initialTheme = saved || (prefersDark ? "dark" : "light");
  
  // Function to apply theme - safely checks for document.body
  function applyTheme() {
    if (document.body) {
      // Apply theme to the document body
      document.body.dataset.theme = initialTheme;
      
      // Check for HDR support
      if (window.matchMedia("(dynamic-range: high)").matches ||
          CSS.supports("color", "color(display-p3 1 1 1)")) {
        document.body.dataset.hdr = "true";
      }
    }
    
    // Apply theme-specific classes to both html and body for better coverage
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark-theme");
      document.documentElement.classList.remove("light-theme");
    } else {
      document.documentElement.classList.add("light-theme");
      document.documentElement.classList.remove("dark-theme");
    }
  }
  
  // Try to apply theme immediately
  applyTheme();
  
  // Also apply when DOM is loaded to ensure body exists
  document.addEventListener('DOMContentLoaded', applyTheme);
})();
*/
