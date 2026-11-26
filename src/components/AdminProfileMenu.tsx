import { useEffect, useId, useRef, useState } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import styles from "./AdminProfileMenu.module.scss";

type AdminProfileMenuProps = {
  username: string;
  mode: "light" | "dark";
  onToggleTheme: () => void;
  onSignOut: () => void;
};

export function AdminProfileMenu({
  username,
  mode,
  onToggleTheme,
  onSignOut,
}: AdminProfileMenuProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const themeLabel = mode === "dark" ? "Light theme" : "Dark theme";
  const themeIcon = mode === "dark" ? "light_mode" : "dark_mode";

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: PointerEvent) {
      const root = rootRef.current;
      if (!root?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function closeAnd(run: () => void) {
    setOpen(false);
    run();
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <UserAvatar name={username} size="sm" />
        <div className={styles.meta}>
          <span className={styles.name}>{username}</span>
          <span className={styles.role}>Administrator</span>
        </div>
      </button>

      {open ? (
        <div className={styles.panel} id={menuId} role="menu" aria-label="Account">
          <button
            type="button"
            role="menuitem"
            className={styles.menuRow}
            onClick={() => closeAnd(onToggleTheme)}
          >
            <span className={`material-symbols-rounded ${styles.menuIcon}`}>{themeIcon}</span>
            <span className={styles.menuLabel}>{themeLabel}</span>
          </button>
          <div className={styles.divider} role="separator" />
          <button
            type="button"
            role="menuitem"
            className={styles.menuRow}
            onClick={() => closeAnd(onSignOut)}
          >
            <span className={`material-symbols-rounded ${styles.menuIcon}`}>logout</span>
            <span className={styles.menuLabel}>Sign out</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}