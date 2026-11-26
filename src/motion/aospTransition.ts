/** Mirrors exteraGram `WindowTransitionAnimationHelper` (AOSP window transitions). */
export const AOSP_TRANSITION_MS = 450;
export const AOSP_SLIDE_PX = 96;

const emphasized = [0.2, 0, 0, 1] as const;

export const aospTransition = {
  type: "tween" as const,
  duration: AOSP_TRANSITION_MS / 1000,
  ease: emphasized,
};

export function aospDetailEnter() {
  return {
    initial: { x: AOSP_SLIDE_PX, opacity: 0.12 },
    animate: { x: 0, opacity: 1 },
    exit: { x: AOSP_SLIDE_PX, opacity: 0.12 },
    transition: aospTransition,
  };
}

export function aospListEnter() {
  return {
    initial: { x: -AOSP_SLIDE_PX, opacity: 0.88 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -AOSP_SLIDE_PX, opacity: 0.88 },
    transition: aospTransition,
  };
}

export function pickAospMotion(forward: boolean, isDetail: boolean) {
  if (isDetail) {
    return forward ? aospDetailEnter() : { ...aospDetailEnter(), initial: aospDetailEnter().exit };
  }
  return forward ? aospListEnter() : { ...aospListEnter(), initial: aospListEnter().exit };
}