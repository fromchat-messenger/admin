import type { CSSProperties, ReactNode } from "react";
import { useCategoryContext } from "@/profile/fromchat/CategoryContext";
import { listItemShapeClass, type ListItemPosition } from "@/profile/fromchat/listItemPosition";
import styles from "@/profile/fromchat/fromchatCategory.module.scss";

export type ProfileListItemProps = {
  headline: string;
  supportingText?: ReactNode;
  leading?: ReactNode;
  leadingIconTint?: string;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
  position?: ListItemPosition;
  groupItemCount?: number;
};

export function ProfileListItem({
  headline,
  supportingText,
  leading,
  leadingIconTint,
  onClick,
  disabled = false,
  divider = false,
  position = "middle",
  groupItemCount,
}: ProfileListItemProps) {
  const category = useCategoryContext();
  const solo = groupItemCount === 1;
  const shapeKey = listItemShapeClass(position, solo) as keyof typeof styles;
  const shapeClass = styles[shapeKey] ?? "";
  const showDivider = divider && position !== "end";

  const body = (
    <>
      {leading ? (
        <span className={styles.itemLeading} style={leadingIconTint ? { color: leadingIconTint } : undefined}>
          {leading}
        </span>
      ) : null}
      <div className={styles.itemBody}>
        <div className={styles.itemHeadline}>{headline}</div>
        {supportingText != null && supportingText !== "" ? (
          <div className={styles.itemSupporting}>{supportingText}</div>
        ) : null}
      </div>
    </>
  );

  return (
    <div
      className={styles.itemWrap}
      style={
        category
          ? ({
              "--fc-divider-color": category.dividerColor,
              "--fc-divider-thickness": `${category.dividerThicknessPx}px`,
            } as CSSProperties)
          : undefined
      }
    >
      {onClick ? (
        <button
          type="button"
          className={`${styles.itemSurface} ${styles.itemRow} ${styles.itemInteractive} ${shapeClass}`}
          onClick={onClick}
          disabled={disabled}
        >
          {body}
        </button>
      ) : (
        <div className={`${styles.itemSurface} ${styles.itemRow} ${shapeClass}`}>{body}</div>
      )}
      {showDivider ? <div className={styles.itemDivider} aria-hidden /> : null}
    </div>
  );
}
