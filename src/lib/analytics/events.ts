import type { FeedbackVariant } from '@/lib/analytics/feedbackEvents';
import type { TourScope } from '@/tours/types';
import type { FeedbackChannel } from '@/types/feedback';
import type { FailureReason, Origin } from 'react-joyride';

/**
 * GA4 커스텀 이벤트 이름 → 파라미터 매핑. 커스텀 이벤트의 단일 소스다.
 * 값은 GA4 제약에 맞춰 기본형(string/number/boolean/null)만 사용한다.
 * 가입·게시판·출석 이벤트는 각 계측 작업(WTH-62~64)에서 이 맵에 항목을 추가한다.
 */
export interface AnalyticsEventParams {
  // 투어 (src/tours/analytics.ts)
  tour_started: TourEventParams & { step_count: number };
  tour_step_viewed: TourEventParams & { step_id: string; step_index: number };
  tour_completed: TourEventParams & { duration_ms: number };
  tour_skipped: TourEventParams & { step_id: string; step_index: number; origin: Origin | null };
  tour_step_failed: TourEventParams & { step_id: string; reason: FailureReason };

  // 서비스 피드백 (src/lib/analytics/feedbackEvents.ts)
  feedback_entry_clicked: FeedbackEventParams;
  feedback_opened: FeedbackEventParams;
  feedback_submitted: FeedbackEventParams & { channel: FeedbackChannel; content_length: number };
}

export type AnalyticsEventName = keyof AnalyticsEventParams;

/** 투어 이벤트 공통 파라미터. */
interface TourEventParams {
  tour_id: string;
  tour_version: number;
  club_id: string;
  scope: TourScope;
}

/** 피드백 이벤트 공통 파라미터. */
interface FeedbackEventParams {
  variant: FeedbackVariant;
  club_id: string;
}
