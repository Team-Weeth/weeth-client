import { sendGAEvent } from '@next/third-parties/google';

import type { AnalyticsEventName, AnalyticsEventParams } from '@/lib/analytics/events';

/**
 * GA4 커스텀 이벤트를 보내는 레포의 유일한 sendGAEvent 호출 지점.
 * 컴포넌트에서 sendGAEvent를 직접 부르지 말고 이 래퍼(또는 도메인별 이벤트 파일)를 경유한다.
 *
 * GoogleAnalytics 스크립트는 프로덕션에서만 마운트되므로(src/app/layout.tsx),
 * 그 외 환경에서는 dataLayer가 없어 전송을 건너뛴다. env는 테스트 가능하도록 호출 시점에 읽는다.
 */
function isAnalyticsEnabled() {
  return typeof window !== 'undefined' && process.env.NEXT_PUBLIC_APP_ENV === 'production';
}

export function trackGA<Name extends AnalyticsEventName>(
  name: Name,
  params: AnalyticsEventParams[Name],
) {
  if (!isAnalyticsEnabled()) return;
  sendGAEvent('event', name, params);
}

interface AnalyticsUser {
  /** 내부 식별자(비 PII). 교차 기기 식별을 위한 GA4 user_id로 설정된다. */
  userId?: string | number;
  /** 이후 모든 이벤트에 붙는 사용자 속성(PostHog super property 대체). */
  properties?: Record<string, string | number | boolean>;
}

/** GA4 user_id·user property를 설정한다. 이후 전송되는 모든 이벤트에 전역으로 적용된다. */
export function setAnalyticsUser({ userId, properties }: AnalyticsUser) {
  if (!isAnalyticsEnabled()) return;
  if (userId !== undefined) sendGAEvent('set', { user_id: String(userId) });
  if (properties) sendGAEvent('set', 'user_properties', properties);
}
