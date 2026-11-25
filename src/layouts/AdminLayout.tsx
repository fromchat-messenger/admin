import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import TopAppBar from "m3-expressive-react/AppBar";
import NavigationRail, { NavigationRailItem } from "m3-expressive-react/NavigationRail";
import Button from "m3-expressive-react/Button";
import { useAuth } from "@/auth/AuthContext";
import { pageTransition } from "@/motion/spring";
import styles from "./AdminLayout.module.scss";

const NAV = [
  { to: "/dashboard", icon: "monitoring", label: "Dashboard" },
  { to: "/accounts", icon: "group", label: "Accounts" },
  { to: "/files", icon: "folder", label: "Files" },
  { to: "/moderation", icon: "shield", label: "Moderation" },
  { to: "/compliance", icon: "policy", label: "Compliance" },
  { to: "/settings", icon: "tune", label: "Settings" },
  { to: "/tools", icon: "handyman", label: "Tools" },
];

export function AdminLayout() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const active =
    NAV.find((item) => location.pathname.startsWith(item.to))?.to ?? "/dashboard";

  return (
    <div className={styles.shell}>
      <aside className={styles.rail}>
        <NavigationRail
          value={active}
          onChange={(_event, value) => navigate(value)}
          variant="expanded"
        >
          {NAV.map((item) => (
            <NavigationRailItem
              key={item.to}
              value={item.to}
              icon={<span className="material-symbols-rounded">{item.icon}</span>}
              label={item.label}
            />
          ))}
        </NavigationRail>
      </aside>
      <div className={styles.main}>
        <TopAppBar
          title="FromChat Admin"
          actions={
            <div className={styles.topActions}>
              <span className={styles.userBadge}>{session?.username}</span>
              <Button variant="text" onClick={logout}>
                Sign out
              </Button>
            </div>
          }
        />
        <motion.main
          className={styles.content}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={pageTransition}
        >
          <Outlet />
        </motion.main>
        <nav className={styles.bottomNav} aria-label="Primary">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? styles.bottomActive : "")}>
              <span className="material-symbols-rounded">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}