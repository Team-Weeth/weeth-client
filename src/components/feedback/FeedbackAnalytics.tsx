'use client';

import { useEffect } from 'react';

import { getFeedbackVariant, registerFeedbackContext } from '@/lib/analytics/feedbackEvents';
import { useClubFeatures } from '@/providers/club-feature-provider';

interface FeedbackAnalyticsProps {
  userId: number;
  clubId: string;
}

/** 서비스 피드백 A/B 측정을 위해 현재 사용자·동아리·그룹을 PostHog에 등록한다. */
function FeedbackAnalytics({ userId, clubId }: FeedbackAnalyticsProps) {
  const { feedbackFabEnabled } = useClubFeatures();
  const variant = getFeedbackVariant(feedbackFabEnabled);

  useEffect(() => {
    registerFeedbackContext({ userId, clubId, variant });
  }, [userId, clubId, variant]);

  return null;
}

export { FeedbackAnalytics, type FeedbackAnalyticsProps };
