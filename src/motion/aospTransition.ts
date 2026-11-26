import { pageTransition } from "@/motion/spring";

const accountsSlideTransition = pageTransition;

export function accountsDetailSlide() {
  return {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
    transition: accountsSlideTransition,
  };
}

export function accountsListSlide() {
  return {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
    transition: accountsSlideTransition,
  };
}