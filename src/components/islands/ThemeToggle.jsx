import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return document.body.dataset.theme || "light";
    }
    return "light";
  });

  useEffect(() => {
    // Update theme on body and documentElement for consistent styling
    document.body.dataset.theme = theme;
    if (theme === "dark") {
      document.documentElement.classList.add("dark-theme");
      document.documentElement.classList.remove("light-theme");
    } else {
      document.documentElement.classList.add("light-theme");
      document.documentElement.classList.remove("dark-theme");
    }
    
    // Store theme preference in local storage
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return (
    <button
      id="theme-toggle-btn"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
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
        backgroundColor: "var(--color-bg-alt)"
      }}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
