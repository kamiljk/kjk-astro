import React, { useEffect, useState } from "react";

const lightModeIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="20"
    width="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ marginRight: 6 }}
  >
    <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.45-1.79l-1.8 1.79 1.42 1.42 1.79-1.8-1.41-1.41zM12 4V1h-1v3h1zm5 8c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5 5-2.24 5-5zm7 1h-3v-1h3v1zm-2.24 7.76l-1.79-1.8-1.42 1.42 1.8 1.79 1.41-1.41zM12 23v-3h-1v3h1zm-7-8H2v-1h3v1zm2.24 5.76l1.79-1.8-1.42-1.42-1.8 1.79 1.43 1.43z" />
  </svg>
);
const darkModeIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="20"
    width="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ marginRight: 6 }}
  >
    <path d="M12 3a9 9 0 0 0 0 18c4.97 0 9-4.03 9-9 0-4.97-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7 0-3.87 3.13-7 7-7 3.87 0 7 3.13 7 7 0 3.87-3.13 7-7 7z" />
  </svg>
);

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
    return "light";
  });

  useEffect(() => {
    console.log("[ThemeToggle] Hydrated. Current theme:", theme);
    document.body.dataset.theme = theme;
    localStorage.setItem("theme", theme);

    // Update <html> classes for theme
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark-theme");
      html.classList.remove("light-theme");
    } else {
      html.classList.add("light-theme");
      html.classList.remove("dark-theme");
    }
  }, [theme]);

  const handleClick = () => {
    console.log("[ThemeToggle] Toggle clicked. Current theme:", theme);
    setTheme(t => (t === "dark" ? "light" : "dark"));
  };
  const handleMouseDown = () => {
    console.log("[ThemeToggle] MouseDown event on toggle button");
  };
  const handlePointerDown = () => {
    console.log("[ThemeToggle] PointerDown event on toggle button");
  };

  return (
    <button
      id="theme-toggle-btn"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onPointerDown={handlePointerDown}
      className="theme-toggle-btn"
      style={{
        background: "none",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        padding: "6px 12px",
        fontWeight: "500",
        fontSize: "14px",
        cursor: "pointer",
        color: "var(--color-text)",
        backgroundColor: "var(--color-bg-alt)",
        display: "flex",
        alignItems: "center",
        transition: "box-shadow 0.2s, text-shadow 0.2s, color 0.2s, background 0.2s"
      }}
    >
      {theme === "dark" ? lightModeIcon : darkModeIcon}
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
