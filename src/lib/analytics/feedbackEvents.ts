import posthog from 'posthog-js';

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

// instrumentation-client.ts는 NEXT_PUBLIC_POSTHOG_KEY가 있을 때만 init한다.
// 미초기화 상태의 SDK 호출은 콘솔 경고만 남기므로 명시적으로 건너뛴다.
function isPostHogReady() {
  return typeof window !== 'undefined' && posthog.__loaded === true;
}

export function getFeedbackVariant(feedbackFabEnabled: boolean): FeedbackVariant {
  return feedbackFabEnabled ? 'fab' : 'settings';
}

/** 이후 모든 이벤트에 동아리와 A/B 그룹이 붙도록 사용자 식별과 super property를 등록한다. */
export function registerFeedbackContext({ userId, clubId, variant }: FeedbackAnalyticsContext) {
  if (!isPostHogReady()) return;
  posthog.identify(String(userId));
  posthog.register({ club_id: clubId, feedback_variant: variant });
}

/** 피드백 진입점(FAB 버튼 / 설정의 서비스 피드백 항목) 클릭 */
export function trackFeedbackEntryClicked({ variant, clubId }: FeedbackEventContext) {
  if (!isPostHogReady()) return;
  posthog.capture('feedback_entry_clicked', { variant, club_id: clubId });
}

/** 피드백 작성 화면(채팅 패널 / 폼 페이지) 노출 */
export function trackFeedbackOpened({ variant, clubId }: FeedbackEventContext) {
  if (!isPostHogReady()) return;
  posthog.capture('feedback_opened', { variant, club_id: clubId });
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
  if (!isPostHogReady()) return;
  posthog.capture('feedback_submitted', {
    variant,
    club_id: clubId,
    channel,
    content_length: contentLength,
  });
}
