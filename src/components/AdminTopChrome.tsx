import Button from "m3-expressive-react/Button";
import { AdminProfileMenu } from "@/components/AdminProfileMenu";
import styles from "./AdminTopChrome.module.scss";

type AdminTopChromeProps = {
  username: string;
  userId: number;
  mode: "light" | "dark";
  onToggleTheme: () => void;
  onSignOut: () => void;
};

export function AdminTopChrome({
  username,
  userId,
  mode,
  onToggleTheme,
  onSignOut,
}: AdminTopChromeProps) {
  const themeLabel = mode === "dark" ? "Light theme" : "Dark theme";
  const themeIcon = mode === "dark" ? "light_mode" : "dark_mode";

  return (
    <header className={styles.chrome}>
      <div className={styles.leading}>
        <Button
          className={styles.themeToggle}
          variant="tonal"
          size="sm"
          onClick={onToggleTheme}
          startIcon={<span className="material-symbols-rounded">{themeIcon}</span>}
        >
          {themeLabel}
        </Button>
      </div>

      <div className={styles.brand}>
        <img className={styles.brandLogo} src="/logo-square.png" width={40} height={40} alt="" />
        <div className={styles.brandTitle}>
          <div className={styles.brandName}>FromChat</div>
          <div className={styles.brandAdmin}>Admin</div>
        </div>
      </div>

      <div className={styles.end}>
        <AdminProfileMenu username={username} userId={userId} onSignOut={onSignOut} />
      </div>
    </header>
  );
}