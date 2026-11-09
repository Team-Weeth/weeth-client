'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { EVENTS, STATUS, useJoyride } from 'react-joyride';
import { useTourActions, useUserId } from '@/stores';
import { TOUR_BASE_OPTIONS, TOUR_LOCALE } from '@/tours/config';
import {
  trackTourCompleted,
  trackTourSkipped,
  trackTourStarted,
  trackTourStepFailed,
  trackTourStepViewed,
} from '@/tours/analytics';
import { getTourSeenKey } from '@/tours/registry';
import { TourTooltip } from './TourTooltip';

import type { TourDefinition } from '@/tours/types';

interface TourRunnerProps {
  clubId: string;
  tour: TourDefinition;
}

function subscribeReducedMotion(callback: () => void) {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  );
}

/** The only place that imports react-joyride at runtime — see .claude/rules/tour.md. */
function TourRunner({ clubId, tour }: TourRunnerProps) {
  const userId = useUserId();
  const { markSeen, finish } = useTourActions();
  const prefersReducedMotion = usePrefersReducedMotion();
  const startedAtRef = useRef<number | null>(null);
  const viewedStepIdsRef = useRef<Set<string>>(new Set());

  const { controls, Tour, on } = useJoyride({
    continuous: true,
    steps: tour.steps,
    scrollToFirstStep: true,
    tooltipComponent: TourTooltip,
    locale: TOUR_LOCALE,
    options: { ...TOUR_BASE_OPTIONS, scrollDuration: prefersReducedMotion ? 0 : 300 },
    styles: {
      spotlight: { stroke: 'var(--color-brand-primary)', strokeWidth: 2, fill: 'transparent' },
    },
    floatingOptions: {
      shiftOptions: { padding: 12 },
      autoUpdate: { animationFrame: !prefersReducedMotion },
    },
  });

  useEffect(() => {
    const seenKey = getTourSeenKey(userId, clubId, tour.id);

    const unsubscribers = [
      on(EVENTS.TOUR_START, (data) => {
        startedAtRef.current = Date.now();
        viewedStepIdsRef.current.clear();
        trackTourStarted({
          tourId: tour.id,
          tourVersion: tour.version,
          clubId,
          scope: tour.scope,
          stepCount: data.size,
        });
      }),
      on(EVENTS.TOOLTIP, (data) => {
        const stepId = data.step.id;
        if (!stepId || viewedStepIdsRef.current.has(stepId)) return;
        viewedStepIdsRef.current.add(stepId);
        trackTourStepViewed({
          tourId: tour.id,
          tourVersion: tour.version,
          clubId,
          scope: tour.scope,
          stepId,
          stepIndex: data.index,
        });
      }),
      on(EVENTS.TARGET_NOT_FOUND, (data) => {
        trackTourStepFailed({
          tourId: tour.id,
          tourVersion: tour.version,
          clubId,
          scope: tour.scope,
          stepId: data.step.id ?? 'unknown',
          reason: 'target_not_found',
        });
      }),
      on(EVENTS.TOUR_END, (data) => {
        markSeen(seenKey, tour.version);
        if (data.status === STATUS.FINISHED) {
          trackTourCompleted({
            tourId: tour.id,
            tourVersion: tour.version,
            clubId,
            scope: tour.scope,
            durationMs: Date.now() - (startedAtRef.current ?? Date.now()),
          });
        } else {
          trackTourSkipped({
            tourId: tour.id,
            tourVersion: tour.version,
            clubId,
            scope: tour.scope,
            stepId: data.step.id ?? 'unknown',
            stepIndex: data.index,
            origin: data.origin,
          });
        }
        finish();
      }),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [clubId, finish, markSeen, on, tour, userId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => controls.start(), tour.startDelayMs ?? 0);
    return () => window.clearTimeout(timeoutId);
  }, [controls, tour.startDelayMs]);

  return Tour;
}

export { TourRunner, type TourRunnerProps };
