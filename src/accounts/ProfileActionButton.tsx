import type { ReactNode } from "react";
import styles from "@/accounts/accountProfile.module.scss";

type ProfileActionButtonProps = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

export function ProfileActionButton({ label, icon, onClick, disabled }: ProfileActionButtonProps) {
  return (
    <button type="button" className={styles.actionButton} onClick={onClick} disabled={disabled}>
      <span className={styles.actionPill} aria-hidden>
        {icon}
      </span>
      <span className={styles.actionLabel}>{label}</span>
    </button>
  );
}