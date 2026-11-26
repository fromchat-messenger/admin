import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import LoadingIndicator from "m3-expressive-react/LoadingIndicator";
import { useAuth } from "@/auth/AuthContext";
import { useAdminTheme } from "@/theme/AdminTheme";
import { apiFetch } from "@/api/client";
import { apiWebSocketUrl } from "@/config";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import page from "@/styles/admin-page.module.scss";
import styles from "./DashboardPage.module.scss";

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

export function DashboardPage() {
  const { session } = useAuth();
  const { mode } = useAdminTheme();
  const chartTick = mode === "dark" ? "rgba(230, 225, 240, 0.75)" : "rgba(29, 27, 32, 0.65)";
  const [connected, setConnected] = useState(false);
  const [host, setHost] = useState({ cpu: 0, mem: 0, disk: 0 });
  const [cpuSeries, setCpuSeries] = useState<{ t: string; v: number }[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});

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
      {
        label: "Registered users",
        value: formatNumber(totals.users_registered),
        icon: "group",
        tone: "violet" as const,
      },
      {
        label: "Public messages",
        value: formatNumber(totals.public_messages),
        icon: "forum",
        tone: "sky" as const,
      },
      {
        label: "Direct messages",
        value: formatNumber(totals.dm_messages),
        icon: "chat",
        tone: "mint" as const,
      },
      {
        label: "Attachments",
        value: formatNumber(totals.message_files),
        icon: "attach_file",
        tone: "peach" as const,
      },
    ],
    [totals],
  );

  const greeting = session?.username ? `Welcome back, ${session.username}` : "Welcome";

  return (
    <div className={page.page}>
      <PageHeader
        title={greeting}
        subtitle={
          connected ? (
            <span className={styles.live}>
              <span className={styles.liveDot} aria-hidden />
              Live metrics connected
            </span>
          ) : (
            <span className={styles.live}>
              <LoadingIndicator /> Connecting to metrics…
            </span>
          )
        }
      />

      <p className={page.hint}>
        Instance overview — counts refresh from the database; host stats stream over WebSocket.
      </p>

      <div className={styles.stats}>
        {statCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
          />
        ))}
      </div>

      <motion.section className={`${page.surfaceCard} ${styles.chartPanel}`} layout>
        <motion.div
          className={styles.chartHead}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <div>
            <h2 className={styles.chartTitle}>CPU usage</h2>
            <p className={page.muted}>Rolling samples from the metrics WebSocket</p>
          </div>
          <motion.div className={styles.hostPills} layout>
            {[
              { label: "CPU", value: host.cpu },
              { label: "Memory", value: host.mem },
              { label: "Disk", value: host.disk },
            ].map((item) => (
              <span key={item.label} className={styles.hostPill}>
                {item.label} {item.value.toFixed(0)}%
              </span>
            ))}
          </motion.div>
        </motion.div>
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={cpuSeries}>
              <defs>
                <linearGradient id="cpuFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--md-sys-color-primary)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--md-sys-color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="color-mix(in srgb, var(--md-sys-color-outline) 20%, transparent)"
                vertical={false}
              />
              <XAxis dataKey="t" hide />
              <YAxis
                domain={[0, 100]}
                unit="%"
                width={44}
                tick={{ fontSize: 12, fill: chartTick }}
              />
              <Tooltip
                formatter={(v) => [`${v}%`, "CPU"]}
                contentStyle={{
                  background: "var(--md-sys-color-surface-container-high)",
                  border: "1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 50%, transparent)",
                  borderRadius: 12,
                  color: "var(--md-sys-color-on-surface)",
                }}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke="var(--md-sys-color-primary)"
                strokeWidth={2}
                fill="url(#cpuFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.section>
    </div>
  );
}