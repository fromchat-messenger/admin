import type { CSSProperties, ReactNode } from "react";
import styles from "@/accounts/accountProfile.module.scss";

type ProfileCategoryProps = {
  title?: string;
  children: ReactNode;
  /** Compose Category margin top — 28dp before details, 8dp between stacked sections. */
  marginTop?: number;
  style?: CSSProperties;
};

export function ProfileCategory({ title, children, marginTop = 28, style }: ProfileCategoryProps) {
  return (
    <section
      className={styles.categoryBlock}
      style={{ marginTop: `${marginTop}px`, ...style }}
    >
      {title ? <h3 className={styles.categoryTitle}>{title}</h3> : null}
      <div className={styles.categorySurface}>{children}</div>
    </section>
  );
}