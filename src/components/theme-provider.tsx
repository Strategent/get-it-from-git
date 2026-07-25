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

    // Sync the iOS/Android status-bar color to the app surface. On iOS Safari,
    // theme-color tints the notch/status-bar area and URL bar chrome. Media-
    // scoped tags only apply when the *system* scheme matches — so we strip
    // the media attribute and enforce a single unscoped tag that always wins.
    const color = theme === "dark" ? "#111111" : "#efeeed";
    let metas = Array.from(
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
    );
    // Remove any media-scoped variants that could override our value.
    metas.forEach((m) => {
      if (m.hasAttribute("media")) m.parentNode?.removeChild(m);
    });
    metas = Array.from(
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
    );
    if (metas.length === 0) {
      const m = document.createElement("meta");
      m.name = "theme-color";
      m.content = color;
      document.head.appendChild(m);
    } else {
      metas.forEach((m) => {
        m.setAttribute("content", color);
        m.removeAttribute("media");
      });
    }

    // Paint html/body so the safe-area (notch/status bar) inherits the surface
    // even before React hydrates on iOS Safari and standalone PWA.
    root.style.backgroundColor = color;
    document.body.style.backgroundColor = color;
    // Persist a CSS custom prop the stylesheet uses for the safe-area paint.
    root.style.setProperty("--app-surface", color);
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
