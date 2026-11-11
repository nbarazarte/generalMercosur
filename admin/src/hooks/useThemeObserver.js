import { useState, useEffect } from "react";

export function useThemeObserver() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark",
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setTheme(localStorage.getItem("theme") || "dark");
    };

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("light");
      setTheme(isDark ? "light" : "dark");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("storage", handleStorageChange);
    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return theme;
}
