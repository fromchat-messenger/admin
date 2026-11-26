import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import LoadingIndicator from "m3-expressive-react/LoadingIndicator";
import NavigationRail, { NavigationRailItem, type NavigationRailVariant } from "m3-expressive-react/NavigationRail";
import { AdminTopChrome } from "@/components/AdminTopChrome";
import { AdminProfileMenu } from "@/components/AdminProfileMenu";
import { useAuth } from "@/auth/AuthContext";
import { useAdminTheme } from "@/theme/AdminTheme";
import { pageTransition } from "@/motion/spring";
import { MainPaneBusyProvider, useMainPaneBusyContext } from "@/layout/MainPaneBusy";
import styles from "./AdminLayout.module.scss";

const NAV_ITEMS = [
  { value: "/dashboard", icon: "space_dashboard", label: "Dashboard" },
  { value: "/accounts", icon: "group", label: "Accounts" },
  { value: "/files", icon: "folder_open", label: "Files" },
  { value: "/moderation", icon: "gpp_good", label: "Moderation" },
  { value: "/compliance", icon: "inventory_2", label: "Compliance" },
  { value: "/settings", icon: "tune", label: "Settings" },
  { value: "/tools", icon: "build", label: "Tools" },
] as const;

const adminEnter = {
  ...pageTransition,
  mass: 0.7,
};

const pageShift = {
  ...pageTransition,
  mass: 0.55,
};

function navValue(pathname: string) {
  const item = NAV_ITEMS.find((entry) => pathname.startsWith(entry.value));
  return item?.value ?? "/dashboard";
}

export function AdminLayout() {
  return (
    <MainPaneBusyProvider>
      <AdminLayoutShell />
    </MainPaneBusyProvider>
  );
}

function AdminLayoutShell() {
  const { busy, label } = useMainPaneBusyContext();
  const { session, logout } = useAuth();
  const { mode, toggleMode } = useAdminTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const fromLogin = Boolean((location.state as { fromLogin?: boolean } | null)?.fromLogin);
  const clearedLoginStateRef = useRef(false);
  const sawPaneBusyRef = useRef(false);
  const [paneOverlayVisible, setPaneOverlayVisible] = useState(true);
  const [paneOverlayFading, setPaneOverlayFading] = useState(false);
  const [paneContentRevealed, setPaneContentRevealed] = useState(false);
  const showPaneOverlay = paneOverlayVisible || paneOverlayFading;
  const overlayKey = location.pathname.replace(/\/accounts\/\d+.*/, "/accounts");
  const railValue = navValue(location.pathname);
  const mobileNav = NAV_ITEMS;
  const [railVariant, setRailVariant] = useState<NavigationRailVariant>("collapsed");
  const railExpanded = railVariant === "expanded";

  useEffect(() => {
    clearedLoginStateRef.current = false;
  }, [fromLogin]);

  useLayoutEffect(() => {
    sawPaneBusyRef.current = false;
    setPaneOverlayVisible(true);
    setPaneOverlayFading(false);
    setPaneContentRevealed(false);

    const frame = requestAnimationFrame(() => {
      setPaneContentRevealed(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [overlayKey]);

  useEffect(() => {
    if (!paneOverlayVisible || paneOverlayFading || !paneContentRevealed) {
      return;
    }
    if (busy) {
      sawPaneBusyRef.current = true;
      return;
    }
    if (sawPaneBusyRef.current) {
      setPaneOverlayFading(true);
    }
  }, [busy, paneContentRevealed, paneOverlayFading, paneOverlayVisible]);

  useEffect(() => {
    if (!paneOverlayVisible || paneOverlayFading || busy || !paneContentRevealed) {
      return;
    }
    const timeout = window.setTimeout(() => {
      if (!sawPaneBusyRef.current && paneOverlayVisible && !paneOverlayFading) {
        setPaneOverlayFading(true);
      }
    }, 64);
    return () => window.clearTimeout(timeout);
  }, [overlayKey, busy, paneContentRevealed, paneOverlayFading, paneOverlayVisible]);

  useEffect(() => {
    if (!paneOverlayFading) {
      return;
    }
    const timeout = window.setTimeout(finishPaneOverlayFade, 480);
    return () => window.clearTimeout(timeout);
  }, [paneOverlayFading]);

  function finishPaneOverlayFade() {
    setPaneOverlayVisible(false);
    setPaneOverlayFading(false);
  }

  function signOut() {
    logout();
    navigate("/login", { replace: true });
  }

  function toggleRail() {
    setRailVariant(railExpanded ? "collapsed" : "expanded");
  }

  return (
    <motion.div
      className={styles.shell}
      data-rail-expanded={railExpanded ? "true" : "false"}
      initial={fromLogin ? { opacity: 0, scale: 0.985 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={adminEnter}
      style={{ transformOrigin: "top center" }}
      onAnimationComplete={() => {
        if (fromLogin && !clearedLoginStateRef.current) {
          clearedLoginStateRef.current = true;
          navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });
        }
      }}
    >
      <NavigationRail
        className={styles.rail}
        variant={railVariant}
        arrangement="center"
        value={railValue}
        onChange={(_, value) => navigate(value)}
      >
        {NAV_ITEMS.map((item) => (
          <NavigationRailItem
            key={item.value}
            value={item.value}
            label={item.label}
            icon={<span className="material-symbols-rounded">{item.icon}</span>}
            selectedIcon={<span className="material-symbols-rounded">{item.icon}</span>}
          />
        ))}
      </NavigationRail>

      <AdminTopChrome
        railExpanded={railExpanded}
        onToggleRail={toggleRail}
        username={session?.username ?? "Admin"}
        userId={session?.userId ?? 1}
        mode={mode}
        onToggleTheme={toggleMode}
        onSignOut={signOut}
      />

      <header className={styles.mobileChrome}>
        <div className={styles.mobileBrand}>
          <img className={styles.mobileLogo} src="/logo-square.png" width={36} height={36} alt="" />
          <span className={styles.mobileTitle}>FromChat Admin</span>
        </div>
        <AdminProfileMenu
          username={session?.username ?? "Admin"}
          userId={session?.userId ?? 1}
          mode={mode}
          onToggleTheme={toggleMode}
          onSignOut={signOut}
        />
      </header>

      <div className={styles.main}>
        <div className={styles.contentStage}>
          {showPaneOverlay ? (
            <div
              className={
                paneOverlayFading
                  ? `${styles.mainPaneOverlay} ${styles.mainPaneOverlayHide}`
                  : styles.mainPaneOverlay
              }
              role="status"
              aria-live="polite"
              aria-busy={!paneOverlayFading}
              aria-label={label}
              onTransitionEnd={(event) => {
                if (paneOverlayFading && event.propertyName === "opacity") {
                  finishPaneOverlayFade();
                }
              }}
            >
              <LoadingIndicator variant="uncontained" aria-label={label} />
            </div>
          ) : null}

          <AnimatePresence mode="popLayout" initial={false}>
            <motion.main
              className={styles.content}
              key={location.pathname}
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={pageShift}
            >
              {paneContentRevealed ? <Outlet key={location.pathname} /> : null}
            </motion.main>
          </AnimatePresence>
        </div>

        <nav className={styles.bottomNav} aria-label="Primary mobile">
          {mobileNav.map((item) => (
            <button
              key={item.value}
              type="button"
              className={
                location.pathname.startsWith(item.value)
                  ? `${styles.bottomItem} ${styles.bottomActive}`
                  : styles.bottomItem
              }
              onClick={() => navigate(item.value)}
            >
              <span className="material-symbols-rounded">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </motion.div>
  );
}