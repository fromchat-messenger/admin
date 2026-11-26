import { AnimatePresence, motion } from "framer-motion";
import { pageTransition } from "@/motion/spring";
import styles from "./LoginErrorBanner.module.scss";

const layoutTransition = {
  ...pageTransition,
  damping: 36,
  bounce: 0,
};

const contentFade = {
  duration: 0.16,
  ease: [0.2, 0, 0, 1] as const,
};

type LoginErrorBannerProps = {
  message: string | null;
};

export function LoginErrorBanner({ message }: LoginErrorBannerProps) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.div
          key={message}
          className={styles.shell}
          initial={{ gridTemplateRows: "0fr" }}
          animate={{ gridTemplateRows: "1fr" }}
          exit={{ gridTemplateRows: "0fr", transition: { ...layoutTransition, delay: 0.14 } }}
          transition={layoutTransition}
        >
          <div className={styles.clip}>
            <motion.p
              className={styles.body}
              role="alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { ...contentFade, delay: 0.1 } }}
              exit={{ opacity: 0, transition: contentFade }}
            >
              {message}
            </motion.p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}