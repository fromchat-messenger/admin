import { AdminProfileMenu } from "@/components/AdminProfileMenu";
import styles from "./AdminTopChrome.module.scss";

type AdminTopChromeProps = {
  username: string;
  userId: number;
  onSignOut: () => void;
};

export function AdminTopChrome({ username, userId, onSignOut }: AdminTopChromeProps) {
  return (
    <header className={styles.chrome}>
      <div className={styles.logoSlot}>
        <img className={styles.brandLogo} src="/logo-square.png" width={40} height={40} alt="" />
      </div>

      <div className={styles.brandWords}>
        <span className={styles.brandName}>FromChat</span>
        <span className={styles.brandAdmin}>Admin</span>
      </div>

      <AdminProfileMenu username={username} userId={userId} onSignOut={onSignOut} />
    </header>
  );
}