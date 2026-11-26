import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { pageTransition } from "@/motion/spring";
import styles from "./LoginErrorBanner.module.scss";

const shellSpring = {
  ...pageTransition,
  bounce: 0,
};

const bodySpring = {
  ...pageTransition,
  mass: 0.65,
  bounce: 0,
};

const bodyExitSpring = {
  ...pageTransition,
  stiffness: 460,
  damping: 36,
  mass: 0.55,
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
      setHeight(0);
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
    <AnimatePresence initial={false}>
      {message ? (
        <motion.div
          key={message}
          className={styles.shell}
          initial={{ height: 0 }}
          animate={{ height }}
          exit={{ height: 0, transition: shellSpring }}
          transition={shellSpring}
        >
          <div ref={innerRef} className={styles.inner}>
            <motion.p
              className={styles.body}
              role="alert"
              initial={{ opacity: 0, y: -6 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { ...bodySpring, opacity: { ...bodySpring, delay: 0.03 } },
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