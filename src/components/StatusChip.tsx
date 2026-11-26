import styles from "./StatusChip.module.scss";

type StatusChipProps = {
  status: "active" | "suspended" | "deleted" | "owner" | "verified" | "neutral";
  children: React.ReactNode;
};

export function StatusChip({ status, children }: StatusChipProps) {
  return (
    <span className={styles.chip} data-status={status}>
      <span className={styles.dot} aria-hidden />
      {children}
    </span>
  );
}