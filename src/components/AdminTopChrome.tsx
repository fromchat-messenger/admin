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
  return (
    <header className={styles.chrome}>
      <div className={styles.start}>
        <div className={styles.brand}>
          <img className={styles.brandLogo} src="/logo-square.png" width={40} height={40} alt="" />
          <div className={styles.brandTitle}>
            <span className={styles.brandName}>FromChat</span>
            <span className={styles.brandAdmin}>Admin</span>
          </div>
        </div>
      </div>
      <AdminProfileMenu
        username={username}
        userId={userId}
        mode={mode}
        onToggleTheme={onToggleTheme}
        onSignOut={onSignOut}
      />
    </header>
  );
}