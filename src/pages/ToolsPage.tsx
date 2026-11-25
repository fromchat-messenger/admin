import { useState } from "react";
import Button from "m3-expressive-react/Button";
import TextField from "m3-expressive-react/TextField";
import { useAuth } from "@/auth/AuthContext";
import { apiFetch } from "@/api/client";
import styles from "./AccountsPage.module.scss";

export function ToolsPage() {
  const { session } = useAuth();
  const [ip, setIp] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className={styles.page}>
      <h1>Tools</h1>
      <section className={styles.section}>
        <h2>Unblock IP</h2>
        <div className={styles.toolbar}>
          <TextField label="IP address" value={ip} onChange={(e) => setIp(e.target.value)} />
          <Button
            variant="filled"
            onClick={() =>
              session &&
              apiFetch("/moderation/unblock-ip", session.token, {
                method: "POST",
                body: JSON.stringify({ ip: ip.trim() }),
              }).then((r) => setMessage((r as { message: string }).message))
            }
          >
            Unblock
          </Button>
        </div>
      </section>
      <section className={styles.section}>
        <h2>Rate limits</h2>
        <Button
          variant="outlined"
          onClick={() =>
            session &&
            apiFetch("/moderation/clear-all-rate-limits", session.token, { method: "POST" }).then(
              (r) => setMessage((r as { message: string }).message),
            )
          }
        >
          Clear all rate limits
        </Button>
      </section>
      {message ? <p className={styles.message}>{message}</p> : null}
    </div>
  );
}