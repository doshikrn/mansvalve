/**
 * Единая motion-система для публичного сайта (B2B: спокойные длительности и easing).
 */

/** Секунды */
export const MOTION_DURATION = {
  fast: 0.3,
  medium: 0.5,
  slow: 0.7,
  /** Карусели товаров — между быстрым и средним */
  carousel: 0.42,
} as const;

/** «Премиальный» ease-out (спокойное замедление в конце) */
export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

export type MotionEase = typeof MOTION_EASE;

export const motionTransition = {
  fast: { duration: MOTION_DURATION.fast, ease: MOTION_EASE },
  medium: { duration: MOTION_DURATION.medium, ease: MOTION_EASE },
  slow: { duration: MOTION_DURATION.slow, ease: MOTION_EASE },
  carousel: { duration: MOTION_DURATION.carousel, ease: MOTION_EASE },
} as const;

/** Варианты для `variants` (framer-motion), синхронно с ScrollReveal */
export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATION.medium, ease: MOTION_EASE },
  },
};
