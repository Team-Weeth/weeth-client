import { trackEvent } from '@/lib/analytics';

import type { TourScope } from './types';
import type { FailureReason, Origin } from 'react-joyride';

interface TourBaseParams {
  tourId: string;
  tourVersion: number;
  clubId: string;
  scope: TourScope;
}

/** Event names live only here — see .claude/rules/tour.md ("Analytics"). */
function trackTourStarted(params: TourBaseParams & { stepCount: number }) {
  trackEvent('tour_started', {
    tour_id: params.tourId,
    tour_version: params.tourVersion,
    club_id: params.clubId,
    scope: params.scope,
    step_count: params.stepCount,
  });
}

function trackTourStepViewed(params: TourBaseParams & { stepId: string; stepIndex: number }) {
  trackEvent('tour_step_viewed', {
    tour_id: params.tourId,
    tour_version: params.tourVersion,
    club_id: params.clubId,
    scope: params.scope,
    step_id: params.stepId,
    step_index: params.stepIndex,
  });
}

function trackTourCompleted(params: TourBaseParams & { durationMs: number }) {
  trackEvent('tour_completed', {
    tour_id: params.tourId,
    tour_version: params.tourVersion,
    club_id: params.clubId,
    scope: params.scope,
    duration_ms: params.durationMs,
  });
}

function trackTourSkipped(
  params: TourBaseParams & { stepId: string; stepIndex: number; origin: Origin | null },
) {
  trackEvent('tour_skipped', {
    tour_id: params.tourId,
    tour_version: params.tourVersion,
    club_id: params.clubId,
    scope: params.scope,
    step_id: params.stepId,
    step_index: params.stepIndex,
    origin: params.origin,
  });
}

function trackTourStepFailed(params: TourBaseParams & { stepId: string; reason: FailureReason }) {
  trackEvent('tour_step_failed', {
    tour_id: params.tourId,
    tour_version: params.tourVersion,
    club_id: params.clubId,
    scope: params.scope,
    step_id: params.stepId,
    reason: params.reason,
  });
}

export {
  trackTourCompleted,
  trackTourSkipped,
  trackTourStarted,
  trackTourStepFailed,
  trackTourStepViewed,
};
