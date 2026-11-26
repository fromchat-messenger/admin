import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import IconButton from "m3-expressive-react/IconButton";
import { useAuth } from "@/auth/AuthContext";
import { useAdminTheme } from "@/theme/AdminTheme";
import { pageTransition } from "@/motion/spring";
import { UserAvatar } from "@/components/UserAvatar";
import { SidebarNav, type SidebarNavItem } from "@/components/SidebarNav";
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

export function AdminLayout() {
  const { session, logout } = useAuth();
  const { mode, toggleMode } = useAdminTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = ROUTE_TITLES[location.pathname] ?? "Admin";
  const mobileNav = NAV_GROUPS.flatMap((group) => group.items);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <motion.div className={styles.brand} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={pageTransition}>
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
          <motion.div className={styles.sidebarUser} layout transition={pageTransition}>
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
              onClick={logout}
            />
          </motion.div>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarStart}>
            <h2 className={styles.crumb}>{pageTitle}</h2>
          </div>
          <motion.div
            className={styles.topbarEnd}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...pageTransition, delay: 0.05 }}
          >
            <IconButton
              variant="tonal"
              icon={
                <span className="material-symbols-rounded">{mode === "dark" ? "light_mode" : "dark_mode"}</span>
              }
              aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              onClick={toggleMode}
            />
          </motion.div>
        </header>

        <motion.main
          className={styles.content}
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={pageTransition}
        >
          <Outlet />
        </motion.main>

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
    </div>
  );
}