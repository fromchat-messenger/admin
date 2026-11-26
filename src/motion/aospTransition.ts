import { pageTransition } from "@/motion/spring";

export const ACCOUNTS_SLIDE_PX = 48;

const accountsSlideTransition = pageTransition;

export function accountsDetailSlide() {
  return {
    initial: { x: ACCOUNTS_SLIDE_PX, opacity: 0.92 },
    animate: { x: 0, opacity: 1 },
    exit: { x: ACCOUNTS_SLIDE_PX, opacity: 0.92 },
    transition: accountsSlideTransition,
  };
}

export function accountsListSlide() {
  return {
    initial: { x: -ACCOUNTS_SLIDE_PX, opacity: 0.92 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -ACCOUNTS_SLIDE_PX, opacity: 0.92 },
    transition: accountsSlideTransition,
  };
}