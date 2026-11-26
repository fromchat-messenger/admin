import Menu, { MenuDivider, MenuItem } from "m3-expressive-react/Menu";
import { UserAvatar } from "@/components/UserAvatar";
import styles from "./AdminProfileMenu.module.scss";

type AdminProfileMenuProps = {
  username: string;
  mode: "light" | "dark";
  onToggleTheme: () => void;
  onSignOut: () => void;
  /** Collapsed navigation rail: icon-only trigger. */
  compact?: boolean;
};

export function AdminProfileMenu({
  username,
  mode,
  onToggleTheme,
  onSignOut,
  compact = false,
}: AdminProfileMenuProps) {
  const themeLabel = mode === "dark" ? "Light theme" : "Dark theme";
  const themeIcon = mode === "dark" ? "light_mode" : "dark_mode";

  return (
    <Menu
      align="end"
      trigger={
        <button
          type="button"
          className={compact ? `${styles.trigger} ${styles.triggerCompact}` : styles.trigger}
          aria-label="Account menu"
        >
          <UserAvatar name={username} size="sm" />
          {compact ? null : (
            <>
              <div className={styles.meta}>
                <span className={styles.name}>{username}</span>
                <span className={styles.role}>Administrator</span>
              </div>
              <span className={`material-symbols-rounded ${styles.more}`} aria-hidden>
                more_vert
              </span>
            </>
          )}
        </button>
      }
    >
      <MenuItem
        startIcon={<span className="material-symbols-rounded">{themeIcon}</span>}
        onClick={onToggleTheme}
      >
        {themeLabel}
      </MenuItem>
      <MenuDivider />
      <MenuItem
        startIcon={<span className="material-symbols-rounded">logout</span>}
        onClick={onSignOut}
      >
        Sign out
      </MenuItem>
    </Menu>
  );
}