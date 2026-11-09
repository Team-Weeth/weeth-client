import { useMutation } from '@tanstack/react-query';

import { getFeedbackVariant, trackFeedbackSubmitted } from '@/lib/analytics/feedbackEvents';
import { feedbackApi } from '@/lib/apis/feedback';
import { useClubFeatures } from '@/providers/club-feature-provider';
import { useClubId } from '@/stores/useClubStore';
import type { CreateFeedbackRequest } from '@/types/feedback';

export function useCreateFeedbackMutation() {
  const clubId = useClubId();
  const { feedbackFabEnabled } = useClubFeatures();

  return useMutation({
    mutationKey: ['feedback', 'create'],
    mutationFn: (body: CreateFeedbackRequest) => {
      if (!clubId) throw new Error('clubId is required');
      return feedbackApi.create(clubId, body);
    },
    // A안/B안 UI가 각자 호출하다 누락·중복되지 않도록 제출 측정은 훅에서 한 번만 남긴다.
    onSuccess: (_, { channel, content }) => {
      if (!clubId) return;
      trackFeedbackSubmitted({
        variant: getFeedbackVariant(feedbackFabEnabled),
        clubId,
        channel,
        contentLength: content.trim().length,
      });
    },
  });
}
