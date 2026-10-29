import { useMutation } from '@tanstack/react-query';

import { feedbackApi } from '@/lib/apis/feedback';
import { useClubId } from '@/stores/useClubStore';
import type { CreateFeedbackRequest } from '@/types/feedback';

export function useCreateFeedbackMutation() {
  const clubId = useClubId();

  return useMutation({
    mutationKey: ['feedback', 'create'],
    mutationFn: (body: CreateFeedbackRequest) => {
      if (!clubId) throw new Error('clubId is required');
      return feedbackApi.create(clubId, body);
    },
  });
}
