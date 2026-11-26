import { useNavigate } from "react-router-dom";
import Button from "m3-expressive-react/Button";
import { UserAvatar } from "@/components/UserAvatar";
import styles from "./AdminProfileMenu.module.scss";

type AdminProfileMenuProps = {
  username: string;
  userId: number;
  mode: "light" | "dark";
  onToggleTheme: () => void;
  onSignOut: () => void;
};

export function AdminProfileMenu({
  username,
  userId,
  mode,
  onToggleTheme,
  onSignOut,
}: AdminProfileMenuProps) {
  const navigate = useNavigate();
  const themeLabel = mode === "dark" ? "Light theme" : "Dark theme";
  const themeIcon = mode === "dark" ? "light_mode" : "dark_mode";

  function openAccount() {
    navigate(`/accounts/${userId}`, { state: { aospForward: true } });
  }

  return (
    <div className={styles.toolbar}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={`Open account for ${username}`}
        onClick={openAccount}
      >
        <UserAvatar name={username} size="sm" />
        <div className={styles.meta}>
          <span className={styles.name}>{username}</span>
          <span className={styles.role}>Administrator</span>
        </div>
      </button>

      <Button
        variant="text"
        size="sm"
        onClick={onToggleTheme}
        startIcon={<span className="material-symbols-rounded">{themeIcon}</span>}
      >
        {themeLabel}
      </Button>
      <Button
        variant="text"
        size="sm"
        onClick={onSignOut}
        startIcon={<span className="material-symbols-rounded">logout</span>}
      >
        Sign out
      </Button>
    </div>
  );
}