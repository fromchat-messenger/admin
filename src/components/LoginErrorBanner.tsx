import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import styles from "./LoginErrorBanner.module.scss";

const EASE = [0.32, 0, 0.2, 1] as const;

const shellEnter = { duration: 0.2, ease: EASE };
const shellExit = { duration: 0.13, ease: EASE };

const bodyEnter = { delay: 0.11, duration: 0.09, ease: EASE };
const bodyExit = { duration: 0.06, ease: EASE };

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
          exit={{ height: 0, transition: shellExit }}
          transition={shellEnter}
        >
          <div ref={innerRef} className={styles.inner}>
            <motion.p
              className={styles.body}
              role="alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: bodyEnter }}
              exit={{ opacity: 0, transition: bodyExit }}
            >
              {message}
            </motion.p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}