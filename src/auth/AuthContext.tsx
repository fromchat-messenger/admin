import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "@/api/client";
import { deriveAuthSecret } from "@/auth/deriveAuthSecret";

type Session = {
  token: string;
  username: string;
  userId: number;
};

type AuthContextValue = {
  session: Session | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "fromchat.admin.session";

const AuthContext = createContext<AuthContextValue | null>(null);

function readStored(): Session | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readStored());

  const login = useCallback(async (username: string, password: string) => {
    const derived = await deriveAuthSecret(username, password);
    const data = await apiFetch<{
      token: string;
      user: { id: number; username: string };
    }>("/auth/steps/password", null, {
      method: "POST",
      body: JSON.stringify({ username, password: derived }),
    });
    if (data.user.id !== 1) {
      throw new Error("Only the system administrator can use this panel.");
    }
    const next: Session = {
      token: data.token,
      username: data.user.username,
      userId: data.user.id,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, login, logout }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth outside AuthProvider");
  }
  return ctx;
}