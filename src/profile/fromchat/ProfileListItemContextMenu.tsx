import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "@/profile/fromchat/fromchatCategory.module.scss";

export type ProfileListItemMenuItem = {
  label: string;
  icon: ReactNode;
  destructive?: boolean;
  onSelect: () => void;
};

type ProfileListItemContextMenuProps = {
  children: ReactNode;
  items: ProfileListItemMenuItem[];
  disabled?: boolean;
};

export function ProfileListItemContextMenu({ children, items, disabled }: ProfileListItemContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onDoc = (event: MouseEvent) => {
      if (wrapRef.current?.contains(event.target as Node)) {
        return;
      }
      close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [close, open]);

  function onContextMenu(event: React.MouseEvent) {
    if (disabled || items.length === 0) {
      return;
    }
    event.preventDefault();
    setPos({ x: event.clientX, y: event.clientY });
    setOpen(true);
  }

  return (
    <div ref={wrapRef} className={styles.contextWrap} onContextMenu={onContextMenu}>
      {children}
      {open ? (
        <div
          className={styles.contextMenu}
          style={{ left: pos.x, top: pos.y }}
          role="menu"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={item.destructive ? styles.contextMenuItemDanger : styles.contextMenuItem}
              onClick={() => {
                item.onSelect();
                close();
              }}
            >
              <span className={styles.contextMenuIcon} aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}