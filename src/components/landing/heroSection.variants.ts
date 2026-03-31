import { type Variants } from 'framer-motion';

export const DELAY = {
  cards: 0,
  wrappers: 1.0,
  leftText: 1.4,
  rightText: 1.95,
  bounce: 3.1,
  final: 4.2,
};

export const heroImageVariants: Variants = {
  hidden: { rotate: -16.38 },
  visible: {
    rotate: -5.61,
    x: 0,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.15, 0.89, 1, 1],
      delay: 0.001,
    },
  },
};

export const whiteCardVariants: Variants = {
  hidden: { opacity: 0, x: '-60vw', y: '60vh', rotate: -68.21 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: -17.21,
    transition: {
      duration: 0.5,
      ease: [0.15, 0.89, 1, 1],
      delay: 0.001,
    },
  },
};

export const greenCardVariants: Variants = {
  hidden: { opacity: 0, x: '60vw', y: '-60vh', rotate: 24.18 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: -10.76,
    transition: {
      duration: 0.5,
      ease: [0.15, 0.89, 1, 1],
      delay: 0.001,
    },
  },
};

export const leftWrapperVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1.2, ease: 'easeOut', delay: 0.5 },
  },
};

export const rightWrapperVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1.2, ease: 'easeOut', delay: 0.7 },
  },
};

// expand(0.4s) → contract(0.35s) = 0.75s 총 duration, times로 분기점 표현
export const oCharVariants: Variants = {
  hidden: { scaleX: 1 },
  visible: {
    scaleX: [1, 1.7, 1],
    transition: {
      duration: 0.75,
      delay: DELAY.bounce,
      ease: ['easeOut', 'easeIn'],
      times: [0, 0.533, 1],
    },
  },
};

export const raeCharVariants: Variants = {
  hidden: { x: 0 },
  visible: {
    x: [0, 100, 0],
    transition: {
      duration: 0.75,
      delay: DELAY.bounce,
      ease: ['easeOut', 'easeIn'],
      times: [0, 0.533, 1],
    },
  },
};

export const topWrapperVariants: Variants = {
  hidden: { y: 0 },
  visible: {
    y: -55,
    transition: { duration: 0.8, ease: 'easeOut', delay: DELAY.final },
  },
};

export const subtitleVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: 'easeOut', delay: DELAY.final },
  },
};

export const ctaVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: 'easeOut', delay: DELAY.final + 0.1 },
  },
};
