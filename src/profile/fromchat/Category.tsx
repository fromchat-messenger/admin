import type { CSSProperties, ReactNode } from "react";
import { CategoryProvider } from "@/profile/fromchat/CategoryContext";
import { categoryDefaults } from "@/profile/fromchat/categoryDefaults";
import styles from "@/profile/fromchat/fromchatCategory.module.scss";

export type CategoryMargin = {
  top?: number;
  bottom?: number;
  inline?: number;
};

type CategoryProps = {
  title?: string;
  margin?: CategoryMargin;
  /** Compose `surfaceContainer` passed into list rows. */
  containerColor?: string;
  /** Card fill — ProfileScreen categories use transparent. */
  backgroundColor?: string;
  roundedCorners?: boolean;
  children: ReactNode;
  style?: CSSProperties;
};

export function Category({
  title,
  margin,
  containerColor = "var(--md-sys-color-surface-container)",
  backgroundColor = "transparent",
  roundedCorners = true,
  children,
  style,
}: CategoryProps) {
  const marginInline = margin?.inline ?? categoryDefaults.marginInlinePx;
  const marginBottom = margin?.bottom ?? categoryDefaults.marginBottomPx;
  const marginTop = margin?.top ?? 0;

  return (
    <CategoryProvider containerColor={containerColor} dividerColor="transparent" dividerThicknessPx={categoryDefaults.dividerThicknessPx}>
      <section
        className={styles.categoryOuter}
        style={{
          marginTop: marginTop ? `${marginTop}px` : undefined,
          ...({
            "--fc-category-margin-inline": `${marginInline}px`,
            "--fc-category-margin-bottom": `${marginBottom}px`,
            "--fc-list-container-color": containerColor,
          } as CSSProperties),
          ...style,
        }}
      >
        {title ? <h3 className={styles.categoryTitle}>{title}</h3> : null}
        <div
          className={styles.categoryCard}
          data-rounded={roundedCorners ? "true" : "false"}
          style={{ backgroundColor }}
        >
          {children}
        </div>
      </section>
    </CategoryProvider>
  );
}