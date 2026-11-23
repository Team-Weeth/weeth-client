import { setAnalyticsUser, trackGA } from '@/lib/analytics/ga';

import type { FeedbackChannel } from '@/types/feedback';

/** 서비스 피드백 A/B 그룹 — fab: FAB 채팅(A안), settings: 마이페이지 설정 폼(B안) */
export type FeedbackVariant = 'fab' | 'settings';

interface FeedbackEventContext {
  variant: FeedbackVariant;
  clubId: string;
}

interface FeedbackSubmittedEvent extends FeedbackEventContext {
  channel: FeedbackChannel;
  contentLength: number;
}

interface FeedbackAnalyticsContext extends FeedbackEventContext {
  userId: number;
}

export function getFeedbackVariant(feedbackFabEnabled: boolean): FeedbackVariant {
  return feedbackFabEnabled ? 'fab' : 'settings';
}

/** 이후 모든 이벤트에 동아리와 A/B 그룹이 붙도록 GA4 user_id·user property를 등록한다. */
export function registerFeedbackContext({ userId, clubId, variant }: FeedbackAnalyticsContext) {
  setAnalyticsUser({ userId, properties: { club_id: clubId, feedback_variant: variant } });
}

/** 피드백 진입점(FAB 버튼 / 설정의 서비스 피드백 항목) 클릭 */
export function trackFeedbackEntryClicked({ variant, clubId }: FeedbackEventContext) {
  trackGA('feedback_entry_clicked', { variant, club_id: clubId });
}

/** 피드백 작성 화면(채팅 패널 / 폼 페이지) 노출 */
export function trackFeedbackOpened({ variant, clubId }: FeedbackEventContext) {
  trackGA('feedback_opened', { variant, club_id: clubId });
}

/**
 * 피드백 등록 성공. useCreateFeedbackMutation이 성공 시 호출하므로 UI에서 다시 호출하지 않는다.
 * 개인정보가 담길 수 있어 본문은 보내지 않고 길이만 기록한다.
 */
export function trackFeedbackSubmitted({
  variant,
  clubId,
  channel,
  contentLength,
}: FeedbackSubmittedEvent) {
  trackGA('feedback_submitted', {
    variant,
    club_id: clubId,
    channel,
    content_length: contentLength,
  });
}
