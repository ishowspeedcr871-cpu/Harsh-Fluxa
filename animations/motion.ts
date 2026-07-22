import type { Variants } from "framer-motion";

const premiumEase = [0.22, 1, 0.36, 1] as const;

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12, filter: "blur(8px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.36, ease: premiumEase },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(8px)",
    transition: { duration: 0.2, ease: premiumEase },
  },
};

export const cardMotion: Variants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -3, scale: 1.01, transition: { duration: 0.22, ease: premiumEase } },
};

export const dialogMotion: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.28, ease: premiumEase } },
  exit: { opacity: 0, scale: 0.98, y: 8, transition: { duration: 0.18, ease: premiumEase } },
};

export const hoverLift = { y: -2, scale: 1.01 };
