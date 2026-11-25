import { useEffect, useState } from "react";
import Button from "m3-expressive-react/Button";
import LoadingIndicator from "m3-expressive-react/LoadingIndicator";
import { useAuth } from "@/auth/AuthContext";
import { apiFetch } from "@/api/client";
import styles from "./AccountsPage.module.scss";

export function SettingsPage() {
  const { session } = useAuth();
  const [info, setInfo] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void apiFetch<Record<string, string>>("/instance/info", null).then(setInfo);
  }, []);

  async function setMode(mode: "compliance" | "e2ee") {
    if (!session || !confirm(`Switch encryption mode to ${mode}?`)) {
      return;
    }
    setLoading(true);
    try {
      const updated = await apiFetch<Record<string, string>>(
        `/admin/encryption-mode?broadcast=true`,
        session.token,
        { method: "PATCH", body: JSON.stringify({ mode }) },
      );
      setInfo(updated);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1>Settings</h1>
      <dl className={styles.dl}>
        <dt>Instance ID</dt>
        <dd>{info.instance_id}</dd>
        <dt>Encryption mode</dt>
        <dd>{info.encryption_mode}</dd>
        <dt>Changed at</dt>
        <dd>{info.encryption_mode_changed_at || "—"}</dd>
      </dl>
      <div className={styles.toolbar}>
        <Button variant="outlined" disabled={loading} onClick={() => setMode("compliance")}>
          Compliance
        </Button>
        <Button variant="outlined" disabled={loading} onClick={() => setMode("e2ee")}>
          E2EE
        </Button>
        {loading ? <LoadingIndicator /> : null}
      </div>
    </div>
  );
}