import IconButton from "m3-expressive-react/IconButton";
import { AdminProfileMenu } from "@/components/AdminProfileMenu";
import styles from "./AdminTopChrome.module.scss";

type AdminTopChromeProps = {
  railExpanded: boolean;
  onToggleRail: () => void;
  username: string;
  mode: "light" | "dark";
  onToggleTheme: () => void;
  onSignOut: () => void;
};

export function AdminTopChrome({
  railExpanded,
  onToggleRail,
  username,
  mode,
  onToggleTheme,
  onSignOut,
}: AdminTopChromeProps) {
  return (
    <header className={styles.chrome}>
      <div className={styles.start}>
        <IconButton
          className={styles.menuBtn}
          variant="tonal"
          size="sm"
          aria-label={railExpanded ? "Collapse navigation rail" : "Expand navigation rail"}
          onClick={onToggleRail}
          icon={
            <span className="material-symbols-rounded">{railExpanded ? "chevron_left" : "menu"}</span>
          }
        />
        <div className={styles.brand}>
          <img className={styles.brandLogo} src="/logo-square.png" width={40} height={40} alt="" />
          <div className={styles.brandText}>
            <span className={styles.brandName}>FromChat</span>
            <span className={styles.brandAdmin}>Admin</span>
          </div>
        </div>
      </div>
      <AdminProfileMenu
        username={username}
        mode={mode}
        onToggleTheme={onToggleTheme}
        onSignOut={onSignOut}
      />
    </header>
  );
}