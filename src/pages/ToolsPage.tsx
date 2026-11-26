import { useState } from "react";
import Button from "m3-expressive-react/Button";
import TextField from "m3-expressive-react/TextField";
import { useAuth } from "@/auth/AuthContext";
import { apiFetch } from "@/api/client";
import { PageHeader } from "@/components/PageHeader";
import page from "@/styles/admin-page.module.scss";

export function ToolsPage() {
  const { session } = useAuth();
  const [ip, setIp] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className={page.page}>
      <PageHeader title="Tools" subtitle="Operational utilities matching backend CLI capabilities" />
      <div className={page.twoCol}>
        <section className={`${page.surfaceCard} ${page.section}`}>
          <h2>Unblock IP</h2>
          <div className={page.toolbar}>
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
        <section className={`${page.surfaceCard} ${page.section}`}>
          <h2>Rate limits</h2>
          <p className={page.muted}>Clears in-memory rate limit counters for all keys.</p>
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
      </div>
      {message ? <p className={page.message}>{message}</p> : null}
    </div>
  );
}