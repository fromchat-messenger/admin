import { motion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { pageTransition } from "@/motion/spring";
import styles from "./LoginErrorBanner.module.scss";

const revealSpring = {
  ...pageTransition,
  mass: 0.65,
  bounce: 0,
};

const shellExitSpring = {
  type: "spring" as const,
  stiffness: 720,
  damping: 44,
  mass: 0.4,
  bounce: 0,
};

const contentExitSpring = {
  type: "spring" as const,
  stiffness: 880,
  damping: 52,
  mass: 0.32,
  bounce: 0,
};

type LoginErrorBannerProps = {
  message: string | null;
};

export function LoginErrorBanner({ message }: LoginErrorBannerProps) {
  const scaleRef = useRef<HTMLDivElement>(null);
  const [copy, setCopy] = useState<string | null>(null);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const open = message !== null;

  useEffect(() => {
    if (message) {
      setCopy(message);
    }
  }, [message]);

  useLayoutEffect(() => {
    if (!message) {
      return;
    }
    const measure = () => {
      const node = scaleRef.current;
      if (!node) {
        return;
      }
      const next = node.offsetHeight;
      if (next > 0) {
        setMeasuredHeight(next);
      }
    };
    measure();
    requestAnimationFrame(measure);
  }, [message]);

  const label = message ?? copy;
  const shellHeight = open ? measuredHeight : 0;

  return (
    <motion.div
      className={styles.shell}
      initial={false}
      animate={{ height: shellHeight }}
      transition={open ? revealSpring : shellExitSpring}
      onAnimationComplete={() => {
        if (!open) {
          setCopy(null);
          setMeasuredHeight(0);
        }
      }}
    >
      {label ? (
        <motion.div
          ref={scaleRef}
          className={styles.scaleWrap}
          initial={false}
          animate={
            open
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0.94 }
          }
          transition={open ? revealSpring : contentExitSpring}
          style={{ transformOrigin: "top center" }}
        >
          <p className={styles.body} role="alert">
            {label}
          </p>
        </motion.div>
      ) : null}
    </motion.div>
  );
}