import { useEffect, useState } from "react";
import Button from "m3-expressive-react/Button";
import { useAuth } from "@/auth/AuthContext";
import { useMainPaneBusy } from "@/layout/MainPaneBusy";
import { apiFetch } from "@/api/client";
import { PageHeader } from "@/components/PageHeader";
import page from "@/styles/admin-page.module.scss";

export function SettingsPage() {
  const { session } = useAuth();
  const [info, setInfo] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [infoReady, setInfoReady] = useState(false);

  useMainPaneBusy(!infoReady, "Loading settings…");
  useMainPaneBusy(loading, "Applying changes…");

  useEffect(() => {
    void apiFetch<Record<string, string>>("/instance/info", null)
      .then(setInfo)
      .finally(() => setInfoReady(true));
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
    <div className={page.page}>
      <PageHeader title="Settings" subtitle="Instance identity and encryption mode" />
      <section className={`${page.surfaceCard} ${page.section}`}>
        <dl className={page.dl}>
          <dt>Instance ID</dt>
          <dd>{info.instance_id}</dd>
          <dt>Encryption mode</dt>
          <dd>{info.encryption_mode}</dd>
          <dt>Changed at</dt>
          <dd>{info.encryption_mode_changed_at || "—"}</dd>
        </dl>
        <div className={page.toolbar}>
          <Button variant="outlined" disabled={loading} onClick={() => setMode("compliance")}>
            Compliance
          </Button>
          <Button variant="outlined" disabled={loading} onClick={() => setMode("e2ee")}>
            E2EE
          </Button>
        </div>
      </section>
    </div>
  );
}