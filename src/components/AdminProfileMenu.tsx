import { useNavigate } from "react-router-dom";
import Button from "m3-expressive-react/Button";
import IconButton from "m3-expressive-react/IconButton";
import { UserAvatar } from "@/components/UserAvatar";
import styles from "./AdminProfileMenu.module.scss";

type AdminProfileMenuProps = {
  username: string;
  userId: number;
  onSignOut: () => void;
  mode: "light" | "dark";
  onToggleTheme: () => void;
};

export function AdminProfileMenu({
  username,
  userId,
  onSignOut,
  mode,
  onToggleTheme,
}: AdminProfileMenuProps) {
  const navigate = useNavigate();
  const themeLabel = mode === "dark" ? "Light theme" : "Dark theme";
  const themeIcon = mode === "dark" ? "light_mode" : "dark_mode";

  function openAccount() {
    navigate(`/accounts/${userId}`, { state: { aospForward: true } });
  }

  return (
    <div className={styles.toolbar}>
      <IconButton
        variant="standard"
        size="sm"
        aria-label={themeLabel}
        onClick={onToggleTheme}
        icon={<span className="material-symbols-rounded">{themeIcon}</span>}
      />

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
        onClick={onSignOut}
        startIcon={<span className="material-symbols-rounded">logout</span>}
      >
        Sign out
      </Button>
    </div>
  );
}