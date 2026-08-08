import type { Variants } from "framer-motion";

export const EASING = {
  dior: [0.21, 0.47, 0.32, 0.98] as const,
};

export const DURATION = {
  fast: 0.3,
  medium: 0.6,
  slow: 1.0,
  verySlow: 1.5,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASING.dior } }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};
