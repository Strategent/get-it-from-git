import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("nexus-theme") as Theme | null;
      if (stored) return stored;
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("nexus-theme", theme);
    // Sync the iOS/Android status-bar color to the app surface so the
    // notch/status-bar area doesn't render as a white strip in dark mode.
    const color = theme === "dark" ? "#111111" : "#efeeed";
    // Update both the generic and media-scoped theme-color tags so iOS/Safari
    // uses the current app surface for the status bar area regardless of the
    // system-level color scheme.
    const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
    if (metas.length === 0) {
      const m = document.createElement("meta");
      m.name = "theme-color";
      m.content = color;
      document.head.appendChild(m);
    } else {
      metas.forEach((m) => { m.content = color; });
    }
    // Paint html/body so the safe-area (notch/status bar) inherits the surface
    // even before React hydrates on iOS PWA / standalone.
    document.documentElement.style.backgroundColor = color;
    document.body.style.backgroundColor = color;
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () =>
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
