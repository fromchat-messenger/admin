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
      <div className={styles.brandLead}>
        <img className={styles.brandLogo} src="/logo-square.png" width={40} height={40} alt="" />
        <div className={styles.brandWords}>
          <p className={styles.brandName}>FromChat</p>
          <p className={styles.brandAdmin}>Admin</p>
        </div>
      </div>

      <AdminProfileMenu username={username} userId={userId} onSignOut={onSignOut} />
    </header>
  );
}