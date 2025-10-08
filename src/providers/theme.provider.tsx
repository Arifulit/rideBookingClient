import { ThemeProviderContext } from "@/context/theme.context";
import { useEffect, useState, useCallback } from "react";

export type Theme = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ride-booking-theme",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    try {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (typeof window === "undefined") return "light";
    
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches 
        ? "dark" 
        : "light";
    }
    return theme as ResolvedTheme;
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches 
      ? "dark" 
      : "light";
  });

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? "dark" : "light";
      setSystemTheme(newSystemTheme);
      
      if (theme === "system") {
        setResolvedTheme(newSystemTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, enableSystem]);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = resolvedTheme === "dark";

    // Add transition class if enabled
    if (!disableTransitionOnChange) {
      root.classList.add("theme-transitioning");
    }

    // Remove existing theme classes
    root.classList.remove("light", "dark");
    
    // Apply new theme
    root.classList.add(resolvedTheme);
    
    // Set color-scheme for better browser integration
    root.style.colorScheme = resolvedTheme;

    // Remove transition class after animation
    if (!disableTransitionOnChange) {
      setTimeout(() => {
        root.classList.remove("theme-transitioning");
      }, 150);
    }

    // Apply theme color meta tag for mobile browsers
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", isDark ? "#0f172a" : "#ffffff");
    } else {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = isDark ? "#0f172a" : "#ffffff";
      document.head.appendChild(meta);
    }
  }, [resolvedTheme, disableTransitionOnChange]);

  const handleSetTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch {
      console.warn("Failed to save theme preference");
    }
    
    if (newTheme === "system") {
      setResolvedTheme(systemTheme);
    } else {
      setResolvedTheme(newTheme as ResolvedTheme);
    }
  }, [storageKey, systemTheme]);

  const value = {
    theme,
    setTheme: handleSetTheme,
    resolvedTheme,
    systemTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
