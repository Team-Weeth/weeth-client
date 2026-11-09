import type { Locale, Options } from 'react-joyride';

/** Above ui/Tooltip's z-[100], below the global z-[9999] toaster. See .claude/rules/design-tokens.md */
const TOUR_Z_INDEX = 110;

const TOUR_LOCALE: Locale = {
  back: '이전',
  close: '닫기',
  last: '시작하기',
  next: '다음',
  skip: '건너뛰기',
  open: '안내 열기',
};

/**
 * Standardised across every tour — see .claude/rules/tour.md ("Standardised vs Overridable Props").
 * Only `step.*` fields (target, title, content, placement, spotlightPadding, isFixed) vary per tour.
 */
const TOUR_BASE_OPTIONS = {
  overlayColor: 'var(--color-overlay-dim)',
  backgroundColor: 'var(--color-container-floating)',
  arrowColor: 'var(--color-container-floating)',
  textColor: 'var(--color-text-on-floating)',
  primaryColor: 'var(--color-button-primary)',
  width: 'var(--tour-tooltip-width)',
  zIndex: TOUR_Z_INDEX,
  spotlightPadding: 8,
  spotlightRadius: 12, // = --radius-md
  offset: 12,
  arrowSize: 10,
  arrowBase: 20,
  scrollOffset: 96, // clears the sticky Header
  skipBeacon: true,
  showProgress: false, // the step counter is rendered by TourTooltip itself
  buttons: ['skip', 'primary'],
  blockTargetInteraction: false,
  overlayClickAction: 'close',
  dismissKeyAction: 'close',
  targetWaitTimeout: 3000,
  closeButtonAction: 'skip',
} satisfies Partial<Options>;

export { TOUR_BASE_OPTIONS, TOUR_LOCALE, TOUR_Z_INDEX };
