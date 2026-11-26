import { useEffect, useState } from "react";
import Button from "m3-expressive-react/Button";
import LoadingIndicator from "m3-expressive-react/LoadingIndicator";
import { useAuth } from "@/auth/AuthContext";
import { apiFetch } from "@/api/client";
import { buildComplianceZip, listComplianceMessageIds } from "@/compliance/bundleExtract";
import { PageHeader } from "@/components/PageHeader";
import page from "@/styles/admin-page.module.scss";

export function CompliancePage() {
  const { session } = useAuth();
  const [mode, setMode] = useState<string>("");
  const [ids, setIds] = useState<number[]>([]);
  const [progress, setProgress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void apiFetch<{ encryption_mode: string }>("/instance/info", null).then((info) =>
      setMode(info.encryption_mode),
    );
    if (session) {
      void listComplianceMessageIds(session.token).then(setIds).catch(() => setIds([]));
    }
  }, [session]);

  if (mode && mode !== "compliance") {
    return (
      <div className={page.page}>
        <PageHeader title="Compliance" />
        <p className={page.hint}>
          Encryption mode is {mode}. Switch to compliance mode in Settings to export bundles.
        </p>
      </div>
    );
  }

  return (
    <div className={page.page}>
      <PageHeader
        title="Compliance bundle"
        subtitle={`${ids.length} messages available · client-side ZIP (sample up to 20)`}
      />
      <section className={`${page.surfaceCard} ${page.section}`}>
        <p className={page.muted}>
          Export uses existing DM/compliance APIs in the browser — no new backend ZIP endpoint.
        </p>
        <Button
          variant="filled"
          disabled={busy || !session || !ids.length}
          onClick={async () => {
            if (!session) {
              return;
            }
            setBusy(true);
            try {
              const blob = await buildComplianceZip(session.token, ids.slice(0, 20), setProgress);
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = "compliance-bundle.zip";
              anchor.click();
              URL.revokeObjectURL(url);
            } finally {
              setBusy(false);
              setProgress(null);
            }
          }}
        >
          {busy ? <LoadingIndicator /> : "Download sample bundle"}
        </Button>
        {progress ? <p className={page.muted}>{progress}</p> : null}
      </section>
    </div>
  );
}