import {
	setRandomNeonAccent,
	restoreAccentColor,
} from "./random-theme-color.js";

// NAVBAR THEME TOGGLE SCRIPT DISABLED - handled by React ThemeToggle component
// document.addEventListener('DOMContentLoaded', () => {
//   // Ensure theme is applied immediately before any rendering occurs
//   const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
//   const saved = localStorage.getItem("theme");
//   const initialTheme = saved || (prefersDark ? "dark" : "light");

//   // Apply theme to the document body immediately
//   document.body.dataset.theme = initialTheme;

//   // Apply theme-specific classes to both html and body for better coverage
//   if (initialTheme === "dark") {
//     document.documentElement.classList.add("dark-theme");
//     document.documentElement.classList.remove("light-theme");
//   } else {
//     document.documentElement.classList.add("light-theme");
//     document.documentElement.classList.remove("dark-theme");
//   }

//   // Navbar theme toggle script
//   const themeToggleBtn = document.getElementById("theme-toggle-btn");

//   if (themeToggleBtn) {
//     const iconContainer = themeToggleBtn.querySelector('.theme-toggle-icon');
//     // SVG definitions for light/dark mode icons
//     // Use consistent SVG icons from the assets directory
//     const lightModeIcon = `
//       <svg xmlns="http://www.w3.org/2000/svg" height="36" width="36" viewBox="0 -960 960 960" fill="currentColor">
//         <path d="M480-340q58 0 99-41t41-99q0-58-41-99t-99-41q-58 0-99 41t-41 99q0 58 41 99t99 41Zm0 60q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-450H40v-60h160v60Zm720 0H760v-60h160v60ZM450-760v-160h60v160h-60Zm0 720v-160h60v160h-60ZM262-658l-100-97 43-44 96 100-39 41Zm494 496-98-100 41-41 99 98-42 43Zm-99-537 98-99 44 42-99 98-43-41ZM162-205l99-98 42 42-98 99-43-43Zm318-275Z"/>
//       </svg>
//     `;

//     const darkModeIcon = `
//       <svg xmlns="http://www.w3.org/2000/svg" height="36" width="36" viewBox="0 -960 960 960" fill="currentColor">
//         <path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q8 0 17 .5t23 1.5q-36 32-56 79t-20 99q0 90 63 153t153 63q52 0 99-18.5t79-51.5q1 12 1.5 19.5t.5 14.5q0 150-105 255T480-120Zm0-60q109 0 190-67.5T771-406q-25 11-53.67 16.5Q688.67-384 660-384q-114.69 0-195.34-80.66Q384-545.31 384-660q0-24 5-51.5t18-62.5q-98 27-162.5 109.5T180-480q0 125 87.5 212.5T480-180Zm-4-297Z"/>
//       </svg>
//     `;

//     // Update the icon based on the current theme
//     function updateThemeIcon(theme) {
//       if (!iconContainer) return;
//       iconContainer.innerHTML = theme === 'dark' ? lightModeIcon : darkModeIcon;
//     }

//     // Toggle theme when button is clicked
//     themeToggleBtn.addEventListener("click", () => {
//       const current = document.body.dataset.theme;
//       const next = current === "light" ? "dark" : "light";

//       // Update theme on the body
//       document.body.dataset.theme = next;

//       // Update classes on document element
//       if (next === "dark") {
//         document.documentElement.classList.add("dark-theme");
//         document.documentElement.classList.remove("light-theme");
//       } else {
//         document.documentElement.classList.add("light-theme");
//         document.documentElement.classList.remove("dark-theme");
//       }

//       // Update the icon to match the new theme
//       updateThemeIcon(next);

//       // Add animation class for transition effect
//       themeToggleBtn.classList.add('theme-active');
//       // Remove the class after animation completes
//       setTimeout(() => themeToggleBtn.classList.remove('theme-active'), 600);

//       // Store the new theme in localStorage
//       localStorage.setItem("theme", next);

//       // Update accent colors
//       setRandomNeonAccent();
//     });

//     // Set the initial icon based on the current theme
//     updateThemeIcon(initialTheme);

//     // Initial theme class
//     if (initialTheme === 'dark') {
//       themeToggleBtn.classList.add('theme-active');
//     }

//     // Restore accent color if available, or set a random one
//     if (!restoreAccentColor()) {
//       setRandomNeonAccent();
//     }
//   } else {
//     console.warn('Navbar theme toggle element not found');
//   }
// });
