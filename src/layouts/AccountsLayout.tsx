import { useMemo } from "react";
import { Outlet, useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { accountsDetailSlide, accountsListSlide } from "@/motion/aospTransition";
import styles from "./AccountsLayout.module.scss";

export function AccountsLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const isDetail = /\/accounts\/\d+\/?$/.test(location.pathname);
  const forward = useMemo(() => {
    const state = location.state as { aospForward?: boolean } | null;
    if (typeof state?.aospForward === "boolean") {
      return state.aospForward;
    }
    return !isDetail;
  }, [isDetail, location.state]);

  const detail = accountsDetailSlide();
  const list = accountsListSlide();

  const motionProps = isDetail
    ? forward
      ? detail
      : { ...detail, initial: detail.exit, animate: detail.animate }
    : forward
      ? { ...list, initial: false }
      : { ...list, initial: list.exit, animate: list.animate };

  return (
    <div className={styles.stack}>
      <AnimatePresence mode="sync" initial={false}>
        <motion.div key={location.pathname} className={styles.layer} {...motionProps}>
          {outlet}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}