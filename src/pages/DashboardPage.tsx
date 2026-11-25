import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "m3-expressive-react/Card";
import LoadingIndicator from "m3-expressive-react/LoadingIndicator";
import { useAuth } from "@/auth/AuthContext";
import { apiFetch } from "@/api/client";
import { apiWebSocketUrl } from "@/config";
import styles from "./DashboardPage.module.scss";

type TickMessage = {
  type: "tick" | "history";
  host?: { cpu_percent: number; memory_percent: number; disk_percent: number };
  cpu_ring?: { cpu_percent: number }[];
  totals?: Record<string, number>;
};

export function DashboardPage() {
  const { session } = useAuth();
  const [connected, setConnected] = useState(false);
  const [host, setHost] = useState({ cpu: 0, mem: 0, disk: 0 });
  const [cpuSeries, setCpuSeries] = useState<{ t: string; v: number }[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!session?.token) {
      return;
    }
    let cancelled = false;
    apiFetch<{
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
      if (data.cpu_ring) {
        setCpuSeries(
          data.cpu_ring.map((point, index) => ({
            t: String(index),
            v: point.cpu_percent,
          })),
        );
      }
      if (data.totals) {
        setTotals(data.totals);
      }
    };
    return () => socket.close();
  }, [session?.token]);

  const statCards = useMemo(
    () => [
      { label: "Registered users", value: totals.users_registered ?? "—" },
      { label: "Public messages", value: totals.public_messages ?? "—" },
      { label: "Direct messages", value: totals.dm_messages ?? "—" },
      { label: "Attachments", value: totals.message_files ?? "—" },
    ],
    [totals],
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <p className={styles.status}>
          {connected ? "Live metrics connected" : <LoadingIndicator />}
        </p>
      </header>
      <div className={styles.stats}>
        {statCards.map((card) => (
          <Card key={card.label} className={styles.statCard}>
            <span className={styles.statLabel}>{card.label}</span>
            <strong className={styles.statValue}>{card.value}</strong>
          </Card>
        ))}
      </div>
      <Card className={styles.chartCard}>
        <h2>CPU usage</h2>
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={cpuSeries}>
              <defs>
                <linearGradient id="cpuFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--md-sys-color-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--md-sys-color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in srgb, var(--md-sys-color-outline) 25%, transparent)" />
              <XAxis dataKey="t" hide />
              <YAxis domain={[0, 100]} unit="%" width={40} />
              <Tooltip formatter={(v) => [`${v}%`, "CPU"]} />
              <Area type="monotone" dataKey="v" stroke="var(--md-sys-color-primary)" fill="url(#cpuFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className={styles.hostMeta}>
          CPU {host.cpu.toFixed(0)}% · Memory {host.mem.toFixed(0)}% · Disk {host.disk.toFixed(0)}%
        </p>
      </Card>
    </div>
  );
}