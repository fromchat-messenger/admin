import { useCallback, useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import styles from "./CpuUsageChart.module.scss";

const WINDOW = 60;

function cssVar(name: string, fallback: string) {
  if (typeof document === "undefined") {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

type CpuUsageChartProps = {
  values: (number | null)[];
  scheme: "light" | "dark";
};

function seriesData(values: (number | null)[]) {
  const x = Array.from({ length: WINDOW }, (_, index) => index);
  const y = values.map((value) => (value == null ? null : value));
  return [x, y] as uPlot.AlignedData;
}

export function CpuUsageChart({ values, scheme }: CpuUsageChartProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const buildOptions = useCallback((width: number): uPlot.Options => {
    const primary = cssVar("--md-sys-color-primary", "#4F5B93");
    const grid = cssVar(
      "--md-sys-color-outline-variant",
      scheme === "dark" ? "#938f99" : "#cac4d0",
    );
    const axis = cssVar(
      "--md-sys-color-on-surface-variant",
      scheme === "dark" ? "#e6e1e5" : "#49454f",
    );

    return {
      width,
      height: 280,
      pxAlign: true,
      cursor: {
        show: true,
        x: false,
        y: false,
        points: { show: true, size: 7, width: 1 },
      },
      legend: { show: false },
      scales: {
        x: { time: false, range: [0, WINDOW - 1] },
        y: { range: [0, 100] },
      },
      axes: [
        { show: false },
        {
          stroke: axis,
          grid: { stroke: grid, width: 1, dash: [4, 4] },
          ticks: { stroke: axis },
          values: (_u, ticks) => ticks.map((t) => `${t}%`),
          size: 46,
          gap: 6,
          font: '12px "Google Sans", system-ui, sans-serif',
        },
      ],
      series: [
        {},
        {
          label: "CPU",
          stroke: primary,
          width: 2,
          fill: `${primary}40`,
          points: { show: false },
          spanGaps: false,
        },
      ],
    };
  }, [scheme]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const width = host.clientWidth || 480;
    const chart = new uPlot(buildOptions(width), seriesData(valuesRef.current), host);
    plotRef.current = chart;

    const resize = () => {
      if (!host.clientWidth) {
        return;
      }
      chart.setSize({ width: host.clientWidth, height: 280 });
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);

    return () => {
      observer.disconnect();
      chart.destroy();
      plotRef.current = null;
    };
  }, [buildOptions]);

  useEffect(() => {
    plotRef.current?.setData(seriesData(values));
  }, [values]);

  return <div ref={hostRef} className={styles.host} role="img" aria-label="CPU usage, last 60 seconds" />;
}