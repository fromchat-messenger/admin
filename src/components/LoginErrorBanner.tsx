import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
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
  const [height, setHeight] = useState(0);

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
        setHeight(next);
      }
    };
    measure();
    requestAnimationFrame(measure);
  }, [message]);

  return (
    <AnimatePresence
      initial={false}
      onExitComplete={() => {
        setHeight(0);
      }}
    >
      {message ? (
        <motion.div
          key={message}
          className={styles.shell}
          initial={{ height: 0 }}
          animate={{ height }}
          exit={{ height: 0, transition: shellExitSpring }}
          transition={revealSpring}
        >
          <motion.div
            ref={scaleRef}
            className={styles.scaleWrap}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, transition: revealSpring }}
            exit={{ opacity: 0, scale: 0.94, transition: contentExitSpring }}
            style={{ transformOrigin: "top center" }}
          >
            <p className={styles.body} role="alert">
              {message}
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}