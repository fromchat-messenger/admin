import { motion } from "framer-motion";
import Button from "m3-expressive-react/Button";
import LoadingIndicator from "m3-expressive-react/LoadingIndicator";
import { pageTransition } from "@/motion/spring";
import styles from "./LoginSubmitButton.module.scss";

const labelTransition = {
  ...pageTransition,
  damping: 26,
};

type LoginSubmitButtonProps = {
  loading: boolean;
};

export function LoginSubmitButton({ loading }: LoginSubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant="filled"
      size="md"
      shape="square"
      className={styles.submit}
      data-loading={loading || undefined}
      aria-busy={loading}
    >
      <span className={styles.stack}>
        <span className={styles.sizer} aria-hidden>
          Continue
        </span>
        <motion.span
          className={styles.layer}
          initial={false}
          animate={{
            y: loading ? "-110%" : "0%",
            opacity: loading ? 0 : 1,
          }}
          transition={labelTransition}
        >
          Continue
        </motion.span>
        <motion.span
          className={styles.layer}
          initial={false}
          animate={{
            y: loading ? "0%" : "110%",
            opacity: loading ? 1 : 0,
          }}
          transition={labelTransition}
          aria-hidden={!loading}
        >
          <span className={styles.indicator} data-md-motion-scheme="expressive">
            <LoadingIndicator size={24} color="currentColor" aria-label="Signing in" />
          </span>
        </motion.span>
      </span>
    </Button>
  );
}