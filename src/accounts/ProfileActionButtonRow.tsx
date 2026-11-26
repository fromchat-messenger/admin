import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/motion/spring";
import styles from "@/accounts/accountProfile.module.scss";

const PRESS_EXPANSION = 1.15;
const DEFAULT_WEIGHT = 1;

export type ProfileAction = {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

function targetFlex(index: number, pressedIndex: number, count: number): number {
  if (pressedIndex < 0 || count <= 1) {
    return DEFAULT_WEIGHT;
  }
  if (index === pressedIndex) {
    return PRESS_EXPANSION;
  }
  return (count * DEFAULT_WEIGHT - PRESS_EXPANSION) / (count - 1);
}

type ProfileActionButtonRowProps = {
  actions: ProfileAction[];
};

export function ProfileActionButtonRow({ actions }: ProfileActionButtonRowProps) {
  const [pressedIndex, setPressedIndex] = useState(-1);
  const [latchedIndex, setLatchedIndex] = useState(-1);

  const effectivePressed = latchedIndex >= 0 ? latchedIndex : pressedIndex;
  const count = actions.length;

  useEffect(() => {
    if (latchedIndex < 0) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setLatchedIndex(-1);
      setPressedIndex(-1);
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [latchedIndex]);

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className={styles.actionRow} role="toolbar" aria-label="Profile actions">
      {actions.map((action, index) => {
        const target = targetFlex(index, effectivePressed, count);
        return (
          <motion.div
            key={action.key}
            className={styles.actionSlot}
            initial={false}
            animate={{ flexGrow: target, flexBasis: 0 }}
            transition={pageTransition}
          >
            <button
              type="button"
              className={styles.actionButton}
              disabled={action.disabled}
              onPointerDown={() => setPressedIndex(index)}
              onPointerUp={() => {
                if (latchedIndex < 0) {
                  setPressedIndex(-1);
                }
              }}
              onPointerLeave={() => {
                if (latchedIndex !== index) {
                  setPressedIndex(-1);
                }
              }}
              onClick={() => {
                setLatchedIndex(index);
                setPressedIndex(index);
                action.onClick();
              }}
            >
              <span className={styles.actionPill} aria-hidden>
                {action.icon}
              </span>
              <span className={styles.actionLabel}>{action.label}</span>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}