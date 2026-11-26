import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminTheme } from "@/theme/AdminTheme";
import styles from "./CpuUsageChart.module.scss";

const WINDOW = 60;

type CpuUsageChartProps = {
  values: (number | null)[];
};

export function CpuUsageChart({ values }: CpuUsageChartProps) {
  const { mode } = useAdminTheme();
  const chartTick = mode === "dark" ? "rgba(230, 225, 240, 0.75)" : "rgba(29, 27, 32, 0.65)";

  const chartData = useMemo(
    () => values.map((cpu, index) => ({ index, cpu })),
    [values],
  );

  return (
    <div className={styles.wrap}>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cpuFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--md-sys-color-primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--md-sys-color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="color-mix(in srgb, var(--md-sys-color-outline-variant) 35%, transparent)"
            vertical={false}
          />
          <XAxis dataKey="index" type="number" domain={[0, WINDOW - 1]} hide />
          <YAxis
            domain={[0, 100]}
            unit="%"
            width={44}
            tick={{ fontSize: 12, fill: chartTick }}
          />
          <Tooltip
            formatter={(v) => (v == null ? ["—", "CPU"] : [`${v}%`, "CPU"])}
            contentStyle={{
              background: "var(--md-sys-color-surface-container-high)",
              border: "1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 50%, transparent)",
              borderRadius: 12,
              color: "var(--md-sys-color-on-surface)",
            }}
            animationDuration={0}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="cpu"
            stroke="var(--md-sys-color-primary)"
            strokeWidth={2}
            fill="url(#cpuFill)"
            connectNulls={false}
            isAnimationActive={false}
            animationDuration={0}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}