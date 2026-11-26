import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { pageTransition } from "@/motion/spring";
import styles from "./LoginErrorBanner.module.scss";

const shellEnterSpring = {
  ...pageTransition,
  bounce: 0,
};

const shellExitSpring = {
  type: "spring" as const,
  stiffness: 720,
  damping: 44,
  mass: 0.4,
  bounce: 0,
};

const bodyEnterSpring = {
  ...pageTransition,
  mass: 0.65,
  bounce: 0,
};

const bodyExitSpring = {
  type: "spring" as const,
  stiffness: 920,
  damping: 54,
  mass: 0.32,
  bounce: 0,
};

type LoginErrorBannerProps = {
  message: string | null;
};

export function LoginErrorBanner({ message }: LoginErrorBannerProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (!message) {
      return;
    }
    const measure = () => {
      const next = innerRef.current?.scrollHeight ?? 0;
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
          transition={shellEnterSpring}
        >
          <div ref={innerRef} className={styles.inner}>
            <motion.p
              className={styles.body}
              role="alert"
              initial={{ opacity: 0, y: -6 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { ...bodyEnterSpring, opacity: { ...bodyEnterSpring, delay: 0.03 } },
              }}
              exit={{ opacity: 0, y: -4, transition: bodyExitSpring }}
            >
              {message}
            </motion.p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}