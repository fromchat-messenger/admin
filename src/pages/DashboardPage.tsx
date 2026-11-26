import { useEffect, useMemo, useState } from "react";
import LoadingIndicator from "m3-expressive-react/LoadingIndicator";
import { useAuth } from "@/auth/AuthContext";
import { apiFetch } from "@/api/client";
import { apiWebSocketUrl } from "@/config";
import { CpuUsageChart } from "@/components/CpuUsageChart";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import page from "@/styles/admin-page.module.scss";
import styles from "./DashboardPage.module.scss";

const CPU_WINDOW = 60;

type TickMessage = {
  type: "tick" | "history";
  host?: { cpu_percent: number; memory_percent: number; disk_percent: number };
  cpu_ring?: { cpu_percent: number }[];
  totals?: Record<string, number>;
};

function formatNumber(n: number | undefined) {
  if (n === undefined || Number.isNaN(n)) {
    return "—";
  }
  return new Intl.NumberFormat().format(n);
}

function emptyCpuWindow(): (number | null)[] {
  return Array.from({ length: CPU_WINDOW }, () => null);
}

function mergeRingIntoWindow(ring: number[]): (number | null)[] {
  const slots = emptyCpuWindow();
  const count = Math.min(ring.length, CPU_WINDOW);
  ring.slice(-count).forEach((value, index) => {
    slots[CPU_WINDOW - count + index] = value;
  });
  return slots;
}

function pushCpuSample(prev: (number | null)[], sample: number): (number | null)[] {
  const filled = prev.filter((value) => value != null).length;
  if (filled < CPU_WINDOW) {
    const next = [...prev];
    next[CPU_WINDOW - filled - 1] = sample;
    return next;
  }
  return [...prev.slice(1), sample];
}

export function DashboardPage() {
  const { session } = useAuth();
  const [connected, setConnected] = useState(false);
  const [host, setHost] = useState({ cpu: 0, mem: 0, disk: 0 });
  const [cpuSlots, setCpuSlots] = useState<(number | null)[]>(emptyCpuWindow);
  const [totals, setTotals] = useState<Record<string, number>>({});

  const displayName = useMemo(() => {
    const name = session?.username ?? "admin";
    return name.length > 24 ? `${name.slice(0, 22)}…` : name;
  }, [session?.username]);

  useEffect(() => {
    if (!session?.token) {
      return;
    }
    let cancelled = false;
    void apiFetch<{
      users_registered: number;
      public_messages: number;
      dm_messages: number;
      message_files: number;
    }>("/admin/stats/summary", session.token).then((data) => {
      if (!cancelled) {
        setTotals(data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [session?.token]);

  useEffect(() => {
    if (!session?.token) {
      return;
    }
    const url = apiWebSocketUrl(`/admin/ws/metrics?token=${encodeURIComponent(session.token)}`);
    const socket = new WebSocket(url);
    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as TickMessage;
      if (data.host) {
        setHost({
          cpu: data.host.cpu_percent,
          mem: data.host.memory_percent,
          disk: data.host.disk_percent,
        });
      }
      if (data.type === "tick" && data.host) {
        setCpuSlots((prev) => pushCpuSample(prev, data.host!.cpu_percent));
      } else if (data.cpu_ring?.length) {
        setCpuSlots(mergeRingIntoWindow(data.cpu_ring.map((point) => point.cpu_percent)));
      }
      if (data.totals) {
        setTotals(data.totals);
      }
    };
    return () => socket.close();
  }, [session?.token]);

  const statCards = useMemo(
    () => [
      { label: "Registered users", value: formatNumber(totals.users_registered), icon: "group" },
      { label: "Public messages", value: formatNumber(totals.public_messages), icon: "forum" },
      { label: "Direct messages", value: formatNumber(totals.dm_messages), icon: "chat" },
      { label: "Attachments", value: formatNumber(totals.message_files), icon: "attach_file" },
    ],
    [totals],
  );

  return (
    <div className={page.page}>
      <PageHeader
        title={`Welcome back, ${displayName}`}
        subtitle={
          connected ? (
            <span className={styles.live}>
              <span className={styles.liveDot} aria-hidden />
              Live metrics · 60s CPU window
            </span>
          ) : (
            <span className={styles.live}>
              <LoadingIndicator /> Connecting…
            </span>
          )
        }
      />

      <p className={page.hint}>
        Counts refresh from the database; host stats stream over WebSocket.
      </p>

      <div className={styles.stats}>
        {statCards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} />
        ))}
      </div>

      <section className={`${page.surfaceCard} ${styles.chartPanel}`}>
        <div className={styles.chartHead}>
          <div>
            <h2 className={styles.chartTitle}>CPU usage</h2>
            <p className={page.muted}>Sliding 60-second window (newest on the right)</p>
          </div>
          <div className={styles.hostPills}>
            {[
              { label: "CPU", value: host.cpu },
              { label: "Memory", value: host.mem },
              { label: "Disk", value: host.disk },
            ].map((item) => (
              <span key={item.label} className={styles.hostPill}>
                {item.label} {item.value.toFixed(0)}%
              </span>
            ))}
          </div>
        </div>
        <CpuUsageChart values={cpuSlots} />
      </section>
    </div>
  );
}