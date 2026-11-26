import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeProvider, type ColorMode } from "m3-expressive-react";

const STORAGE_KEY = "fromchat.admin.color-mode";

type AdminThemeContextValue = {
  mode: ColorMode;
  setMode: (mode: ColorMode) => void;
  toggleMode: () => void;
};

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

function readInitialMode(): ColorMode {
  if (typeof window === "undefined") {
    return "light";
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ColorMode>(readInitialMode);

  const setMode = useCallback((next: ColorMode) => {
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((current) => {
      const next: ColorMode = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        return;
      }
      setModeState(mq.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const ctx = useMemo(() => ({ mode, setMode, toggleMode }), [mode, setMode, toggleMode]);

  return (
    <AdminThemeContext.Provider value={ctx}>
      <ThemeProvider
        seedColor="#4F5B93"
        mode={mode}
        motionScheme="standard"
        as="div"
        style={{
          minHeight: "100dvh",
          overflowX: "clip",
          background: "var(--md-sys-color-surface)",
          color: "var(--md-sys-color-on-surface)",
        }}
      >
        {children}
      </ThemeProvider>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    throw new Error("useAdminTheme must be used within AdminThemeProvider");
  }
  return ctx;
}