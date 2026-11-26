import { AnimatePresence, motion } from "framer-motion";
import { pageTransition } from "@/motion/spring";
import styles from "./LoginErrorBanner.module.scss";

const errorTransition = {
  ...pageTransition,
  damping: 34,
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
          className={styles.root}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={errorTransition}
        >
          <p className={styles.body} role="alert">
            {message}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}