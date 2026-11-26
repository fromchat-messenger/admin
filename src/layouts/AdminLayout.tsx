import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import IconButton from "m3-expressive-react/IconButton";
import LoadingIndicator from "m3-expressive-react/LoadingIndicator";
import { useAuth } from "@/auth/AuthContext";
import { useAdminTheme } from "@/theme/AdminTheme";
import { pageTransition } from "@/motion/spring";
import { UserAvatar } from "@/components/UserAvatar";
import { SidebarNav, type SidebarNavItem } from "@/components/SidebarNav";
import { MainPaneBusyProvider, useMainPaneBusyContext } from "@/layout/MainPaneBusy";
import styles from "./AdminLayout.module.scss";

const NAV_GROUPS: { label: string; items: SidebarNavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { to: "/dashboard", icon: "space_dashboard", label: "Dashboard" },
      { to: "/accounts", icon: "group", label: "Accounts" },
      { to: "/files", icon: "folder_open", label: "Files" },
    ],
  },
  {
    label: "Trust & safety",
    items: [
      { to: "/moderation", icon: "gpp_good", label: "Moderation" },
      { to: "/compliance", icon: "inventory_2", label: "Compliance" },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/settings", icon: "tune", label: "Settings" },
      { to: "/tools", icon: "build", label: "Tools" },
    ],
  },
];

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/accounts": "Accounts",
  "/files": "Files",
  "/moderation": "Moderation",
  "/compliance": "Compliance",
  "/settings": "Settings",
  "/tools": "Tools",
};

const adminEnter = {
  ...pageTransition,
  mass: 0.7,
};

const pageShift = {
  ...pageTransition,
  mass: 0.55,
};

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
  const pageTitle = ROUTE_TITLES[location.pathname] ?? "Admin";
  const mobileNav = NAV_GROUPS.flatMap((group) => group.items);

  useEffect(() => {
    clearedLoginStateRef.current = false;
  }, [fromLogin]);

  function signOut() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <motion.div
      className={styles.shell}
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
      <aside className={styles.sidebar}>
        <motion.div className={styles.brand} initial={false} animate={{ opacity: 1 }} transition={pageTransition}>
          <img className={styles.brandLogo} src="/logo-square.png" width={44} height={44} alt="" />
          <div className={styles.brandText}>
            <span className={styles.brandName}>FromChat</span>
            <span className={styles.brandTag}>Admin</span>
          </div>
        </motion.div>

        <nav className={styles.sideNav} aria-label="Main">
          {NAV_GROUPS.map((group) => (
            <SidebarNav
              key={group.label}
              label={group.label}
              items={group.items}
              activePath={location.pathname}
            />
          ))}
        </nav>

        <div className={styles.sidebarFoot}>
          <div className={styles.sidebarUser}>
            <UserAvatar name={session?.username ?? "Admin"} size="sm" />
            <div className={styles.sidebarUserMeta}>
              <span className={styles.sidebarUserName}>{session?.username}</span>
              <span className={styles.sidebarUserRole}>Administrator</span>
            </div>
            <IconButton
              className={styles.sidebarLogout}
              variant="tonal"
              icon={<span className="material-symbols-rounded">logout</span>}
              aria-label="Sign out"
              onClick={signOut}
            />
          </div>
        </div>
      </aside>

      <AnimatePresence initial={false}>
        {busy ? (
          <motion.div
            key="main-pane-busy"
            className={styles.shellOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ...pageTransition, mass: 0.5 }}
            role="status"
            aria-live="polite"
            aria-busy
          >
            <LoadingIndicator size={72} color="var(--md-sys-color-primary)" aria-label={label} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarStart}>
            <h2 className={styles.crumb}>{pageTitle}</h2>
          </div>
          <div className={styles.topbarEnd}>
            <IconButton
              variant="tonal"
              icon={
                <span className="material-symbols-rounded">{mode === "dark" ? "light_mode" : "dark_mode"}</span>
              }
              aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              onClick={toggleMode}
            />
          </div>
        </header>

        <div className={styles.contentStage}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.main
              className={styles.content}
              key={location.pathname}
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={pageShift}
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>

        <nav className={styles.bottomNav} aria-label="Primary mobile">
          {mobileNav.map((item) => (
            <button
              key={item.to}
              type="button"
              className={
                location.pathname.startsWith(item.to)
                  ? `${styles.bottomItem} ${styles.bottomActive}`
                  : styles.bottomItem
              }
              onClick={() => navigate(item.to)}
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