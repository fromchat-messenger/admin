import { useCallback, useEffect, useRef, useState, type ReactNode, type UIEventHandler } from "react";
import styles from "@/profile/overlayAutoHideScroll.module.scss";

const HIDE_AFTER_MS = 2000;

type OverlayAutoHideScrollProps = {
  children: ReactNode;
  className?: string;
};

export function OverlayAutoHideScroll({ children, className }: OverlayAutoHideScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [thumb, setThumb] = useState({ height: 40, offset: 0, visible: false, dragging: false });

  const updateThumb = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = el;
  if (scrollHeight <= clientHeight + 1) {
      setThumb((prev) => ({ ...prev, visible: false, height: 0, offset: 0 }));
      return;
    }
    const ratio = clientHeight / scrollHeight;
    const height = Math.max(28, clientHeight * ratio);
    const maxOffset = clientHeight - height;
    const offset = maxOffset > 0 ? (scrollTop / (scrollHeight - clientHeight)) * maxOffset : 0;
    setThumb((prev) => ({ ...prev, height, offset }));
  }, []);

  const showThumb = useCallback(() => {
    updateThumb();
    setThumb((prev) => ({ ...prev, visible: true }));
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    hideTimer.current = setTimeout(() => {
      setThumb((prev) => (prev.dragging ? prev : { ...prev, visible: false }));
    }, HIDE_AFTER_MS);
  }, [updateThumb]);

  const onScroll: UIEventHandler<HTMLDivElement> = () => {
    showThumb();
  };

  useEffect(() => {
    updateThumb();
    const ro = new ResizeObserver(() => updateThumb());
    if (scrollRef.current) {
      ro.observe(scrollRef.current);
    }
    return () => {
      ro.disconnect();
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [updateThumb, children]);

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <div
        ref={scrollRef}
        className={styles.viewport}
        onScroll={onScroll}
        onWheel={showThumb}
        onTouchMove={showThumb}
      >
        {children}
      </div>
      <div
        className={thumb.visible ? `${styles.track} ${styles.trackVisible}` : styles.track}
        aria-hidden
      >
        <div
          className={styles.thumb}
          style={{
            height: `${thumb.height}px`,
            transform: `translateY(${thumb.offset}px)`,
          }}
        />
      </div>
    </div>
  );
}