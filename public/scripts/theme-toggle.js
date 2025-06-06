/**
 * Simple theme toggle functionality
 */
// THEME TOGGLE SCRIPT DISABLED - handled by React ThemeToggle component
// document.addEventListener('DOMContentLoaded', () => {
//   // Get the stored theme or use system preference
//   const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//   const savedTheme = localStorage.getItem("theme");
//   const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

//   // Apply initial theme
//   document.body.dataset.theme = initialTheme;

//   // Set up theme toggle button
//   const themeToggleBtn = document.getElementById("theme-toggle-btn");
//   if (themeToggleBtn) {
//     const iconContainer = themeToggleBtn.querySelector('.theme-toggle-icon');

//     // Simple SVG icons
//     const lightModeIcon = `
//       <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="currentColor">
//         <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z"/>
//       </svg>
//     `;

//     const darkModeIcon = `
//       <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="currentColor">
//         <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
//       </svg>
//     `;

//     // Update icon based on current theme
//     function updateThemeIcon(theme) {
//       if (iconContainer) {
//         iconContainer.innerHTML = theme === 'dark' ? lightModeIcon : darkModeIcon;
//       }
//     }

//     // Set initial icon
//     updateThemeIcon(initialTheme);

//     // Toggle theme on button click
//     themeToggleBtn.addEventListener("click", () => {
//       const current = document.body.dataset.theme;
//       const next = current === "light" ? "dark" : "light";

//       // Update theme
//       document.body.dataset.theme = next;
//       updateThemeIcon(next);

//       // Store theme preference
//       localStorage.setItem("theme", next);
//     });
//   }
// });
