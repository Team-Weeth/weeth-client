import { type Variants } from 'framer-motion';

export const DELAY = {
  cards: 0,
  wrappers: 1.0,
  leftText: 1.4,
  rightText: 1.95,
  bounce: 2.5,
  final: 3.25,
};

export const whiteCardVariants: Variants = {
  hidden: { opacity: 0, x: '-60vw', y: '60vh', rotate: -68 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: -17,
    transition: { duration: 1.0, ease: 'easeOut', delay: DELAY.cards },
  },
};

export const greenCardVariants: Variants = {
  hidden: { opacity: 0, x: '60vw', y: '-60vh', rotate: 24 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: -10,
    transition: { duration: 1.0, ease: 'easeOut', delay: DELAY.cards },
  },
};

export const leftWrapperVariants: Variants = {
  hidden: { width: 0 },
  visible: {
    width: 'auto',
    transition: { duration: 0.4, ease: 'easeOut', delay: DELAY.wrappers },
  },
};

export const rightWrapperVariants: Variants = {
  hidden: { width: 0 },
  visible: {
    width: 'auto',
    transition: { duration: 0.4, ease: 'easeOut', delay: DELAY.wrappers },
  },
};

export const leftTextVariants: Variants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut', delay: DELAY.leftText },
  },
};

export const rightTextVariants: Variants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut', delay: DELAY.rightText },
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
