import { useId, useMemo } from "react";
import styles from "./CpuUsageChart.module.scss";

const WINDOW = 60;
const HEIGHT = 280;
const PLOT_LEFT = 46;
const PLOT_RIGHT = 8;
const PLOT_TOP = 8;
const PLOT_BOTTOM = 8;

type CpuUsageChartProps = {
  values: (number | null)[];
};

function buildPath(values: (number | null)[], plotWidth: number, plotHeight: number) {
  const step = plotWidth / (WINDOW - 1);
  const toY = (value: number) => PLOT_TOP + plotHeight * (1 - value / 100);
  let path = "";
  let penDown = false;

  for (let i = 0; i < WINDOW; i += 1) {
    const sample = values[i];
    if (sample == null) {
      penDown = false;
      continue;
    }
    const x = PLOT_LEFT + i * step;
    const y = toY(sample);
    path += penDown ? ` L ${x.toFixed(2)} ${y.toFixed(2)}` : ` M ${x.toFixed(2)} ${y.toFixed(2)}`;
    penDown = true;
  }
  return path;
}

function buildArea(path: string, values: (number | null)[], plotWidth: number, plotHeight: number) {
  const step = plotWidth / (WINDOW - 1);
  const toY = (value: number) => PLOT_TOP + plotHeight * (1 - value / 100);
  let firstX: number | null = null;
  let lastX: number | null = null;

  for (let i = 0; i < WINDOW; i += 1) {
    const sample = values[i];
    if (sample == null) {
      continue;
    }
    const x = PLOT_LEFT + i * step;
    if (firstX == null) {
      firstX = x;
    }
    lastX = x;
  }

  if (firstX == null || lastX == null || !path) {
    return "";
  }

  const baseline = PLOT_TOP + plotHeight;
  return `${path} L ${lastX.toFixed(2)} ${baseline.toFixed(2)} L ${firstX.toFixed(2)} ${baseline.toFixed(2)} Z`;
}

export function CpuUsageChart({ values }: CpuUsageChartProps) {
  const clipId = useId().replace(/:/g, "");
  const safeValues = useMemo(() => {
    if (values.length >= WINDOW) {
      return values.slice(0, WINDOW);
    }
    const padded = [...values];
    while (padded.length < WINDOW) {
      padded.push(null);
    }
    return padded;
  }, [values]);

  const viewWidth = 800;
  const plotWidth = viewWidth - PLOT_LEFT - PLOT_RIGHT;
  const plotHeight = HEIGHT - PLOT_TOP - PLOT_BOTTOM;
  const linePath = useMemo(
    () => buildPath(safeValues, plotWidth, plotHeight),
    [safeValues, plotWidth, plotHeight],
  );
  const areaPath = useMemo(
    () => buildArea(linePath, safeValues, plotWidth, plotHeight),
    [linePath, safeValues, plotWidth, plotHeight],
  );

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${viewWidth} ${HEIGHT}`}
      role="img"
      aria-label="CPU usage, last 60 seconds"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`cpuArea-${clipId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--md-sys-color-primary)" stopOpacity={0.35} />
          <stop offset="100%" stopColor="var(--md-sys-color-primary)" stopOpacity={0} />
        </linearGradient>
      </defs>

      {yTicks.map((tick) => {
        const y = PLOT_TOP + plotHeight * (1 - tick / 100);
        return (
          <g key={tick}>
            <line
              x1={PLOT_LEFT}
              x2={viewWidth - PLOT_RIGHT}
              y1={y}
              y2={y}
              className={styles.gridLine}
            />
            <text x={PLOT_LEFT - 6} y={y + 4} textAnchor="end" className={styles.yLabel}>
              {tick}%
            </text>
          </g>
        );
      })}

      {areaPath ? <path d={areaPath} fill={`url(#cpuArea-${clipId})`} /> : null}
      {linePath ? <path d={linePath} className={styles.line} fill="none" /> : null}
    </svg>
  );
}