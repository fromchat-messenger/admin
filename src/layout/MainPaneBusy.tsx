import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type BusyEntry = {
  label: string;
};

type MainPaneBusyContextValue = {
  register: (key: string, active: boolean, label: string) => void;
  busy: boolean;
  label: string;
};

const DEFAULT_LABEL = "Loading…";

const MainPaneBusyContext = createContext<MainPaneBusyContextValue | null>(null);

export function MainPaneBusyProvider({ children }: { children: ReactNode }) {
  const entriesRef = useRef<Map<string, BusyEntry>>(new Map());
  const [revision, setRevision] = useState(0);

  const sync = useCallback(() => {
    setRevision((value) => value + 1);
  }, []);

  const register = useCallback(
    (key: string, active: boolean, label: string) => {
      if (active) {
        entriesRef.current.set(key, { label });
      } else {
        entriesRef.current.delete(key);
      }
      sync();
    },
    [sync],
  );

  const value = useMemo((): MainPaneBusyContextValue => {
    void revision;
    const entries = [...entriesRef.current.values()];
    return {
      register,
      busy: entries.length > 0,
      label: entries[entries.length - 1]?.label ?? DEFAULT_LABEL,
    };
  }, [register, revision]);

  return <MainPaneBusyContext.Provider value={value}>{children}</MainPaneBusyContext.Provider>;
}

export function useMainPaneBusyContext() {
  const ctx = useContext(MainPaneBusyContext);
  if (!ctx) {
    throw new Error("useMainPaneBusyContext outside MainPaneBusyProvider");
  }
  return ctx;
}

export function useMainPaneBusy(active: boolean, label: string = DEFAULT_LABEL) {
  const id = useId();
  const { register } = useMainPaneBusyContext();

  useEffect(() => {
    register(id, active, label);
    return () => register(id, false, label);
  }, [active, id, label, register]);
}