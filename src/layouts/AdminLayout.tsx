import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "m3-expressive-react/Button";
import { useAuth } from "@/auth/AuthContext";
import { pageTransition } from "@/motion/spring";
import { UserAvatar } from "@/components/UserAvatar";
import styles from "./AdminLayout.module.scss";

type NavItem = { to: string; icon: string; label: string };

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
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
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = ROUTE_TITLES[location.pathname] ?? "Admin";

  const mobileNav: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <motion.div
          className={styles.brand}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={pageTransition}
        >
          <span className={styles.brandMark}>
            <span className="material-symbols-rounded">forum</span>
          </span>
          <motion.div
            className={styles.brandText}
            initial={{ width: "auto", opacity: 1 }}
            animate={{ width: "auto", opacity: 1 }}
            transition={pageTransition}
          >
            <span className={styles.brandName}>FromChat</span>
            <span className={styles.brandTag}>Admin</span>
          </motion.div>
        </motion.div>

        <nav className={styles.sideNav} aria-label="Main">
          {NAV_GROUPS.map((group) => (
            <motion.div
              key={group.label}
              className={styles.navGroup}
              layout
              transition={pageTransition}
            >
              <span className={styles.groupLabel}>{group.label}</span>
              <ul className={styles.navList}>
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                      }
                    >
                      <span className="material-symbols-rounded" aria-hidden>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </nav>

        <div className={styles.sidebarFoot}>
          <div className={styles.sidebarUser}>
            <UserAvatar name={session?.username ?? "Admin"} size="sm" />
            <div className={styles.sidebarUserMeta}>
              <span className={styles.sidebarUserName}>{session?.username}</span>
              <span className={styles.sidebarUserRole}>Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      <motion.div
        className={styles.main}
        layout
        transition={pageTransition}
      >
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
            <button type="button" className={styles.iconBtn} aria-label="Notifications">
              <span className="material-symbols-rounded">notifications</span>
            </button>
            <div className={styles.profileChip}>
              <UserAvatar name={session?.username ?? "Admin"} size="sm" />
              <div>
                <span className={styles.profileName}>{session?.username}</span>
                <span className={styles.profileRole}>Owner</span>
              </div>
            </div>
            <Button variant="text" onClick={logout}>
              Sign out
            </Button>
          </motion.div>
        </header>

        <motion.main
          className={styles.content}
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
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
      </motion.div>
    </div>
  );
}