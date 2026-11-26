import { useLayoutEffect, useMemo, useRef } from "react";
import { Outlet, useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { accountsDetailSlide, accountsListSlide } from "@/motion/aospTransition";
import styles from "./AccountsLayout.module.scss";

const ACCOUNTS_DETAIL = /\/accounts\/\d+\/?$/;

export function AccountsLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const previousPathRef = useRef(location.pathname);
  const isDetail = ACCOUNTS_DETAIL.test(location.pathname);
  const forward = useMemo(() => {
    const state = location.state as { aospForward?: boolean } | null;
    if (typeof state?.aospForward === "boolean") {
      return state.aospForward;
    }
    const previous = previousPathRef.current;
    const wasDetail = ACCOUNTS_DETAIL.test(previous);
    if (isDetail && !wasDetail) {
      return true;
    }
    if (!isDetail && wasDetail) {
      return false;
    }
    return !isDetail;
  }, [isDetail, location.pathname, location.state]);

  useLayoutEffect(() => {
    previousPathRef.current = location.pathname;
  }, [location.pathname]);

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