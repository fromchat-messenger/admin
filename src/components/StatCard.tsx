import type { ReactNode } from "react";
import styles from "./StatCard.module.scss";

type StatCardProps = {
  label: string;
  value: ReactNode;
  icon: string;
  hint?: string;
};

export function StatCard({ label, value, icon, hint }: StatCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.iconWrap}>
        <span className="material-symbols-rounded" aria-hidden>
          {icon}
        </span>
      </div>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </article>
  );
}