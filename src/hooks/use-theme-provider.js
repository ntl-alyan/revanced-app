import { createContext, useContext, useEffect, useState } from "react";


const initialState = {
  theme: "dark", // Changed from system to dark
  setTheme: () => null,
};


const ThemeProviderContext = createContext(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark", // Changed default to dark
  storageKey = "ui-theme",
  ...props
}) {
  const [theme, setTheme] = useState(() => {
    // Always use dark theme by default
    return "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
