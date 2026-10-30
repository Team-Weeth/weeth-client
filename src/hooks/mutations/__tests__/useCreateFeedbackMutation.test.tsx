import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { DEFAULT_CLUB_FEATURES } from '@/flags/club-features/definitions';
import { useCreateFeedbackMutation } from '@/hooks/mutations/useCreateFeedbackMutation';
import { trackFeedbackSubmitted } from '@/lib/analytics/feedbackEvents';
import { server } from '@/mocks/server';
import { ClubFeatureProvider } from '@/providers/club-feature-provider';
import { createQueryClient, createWrapper } from '@/test-utils/query';

jest.mock('@/stores/useClubStore', () => ({ useClubId: () => 'club-1' }));
jest.mock('@/lib/analytics/feedbackEvents', () => ({
  ...jest.requireActual('@/lib/analytics/feedbackEvents'),
  trackFeedbackSubmitted: jest.fn(),
}));

const mockTrackFeedbackSubmitted = jest.mocked(trackFeedbackSubmitted);

function renderMutation(feedbackFabEnabled: boolean) {
  const QueryWrapper = createWrapper(createQueryClient());
  return renderHook(() => useCreateFeedbackMutation(), {
    wrapper: ({ children }) => (
      <QueryWrapper>
        <ClubFeatureProvider features={{ ...DEFAULT_CLUB_FEATURES, feedbackFabEnabled }}>
          {children}
        </ClubFeatureProvider>
      </QueryWrapper>
    ),
  });
}

it('등록 성공 시 그룹·채널·trim된 본문 길이로 제출 이벤트를 남긴다', async () => {
  const { result } = renderMutation(true);

  await act(() => result.current.mutateAsync({ content: '  느려요  ', channel: 'CHAT' }));

  expect(mockTrackFeedbackSubmitted).toHaveBeenCalledWith({
    variant: 'fab',
    clubId: 'club-1',
    channel: 'CHAT',
    contentLength: 3,
  });
});

it('등록에 실패하면 제출 이벤트를 남기지 않는다', async () => {
  server.use(
    http.post('/api/proxy/clubs/:clubId/feedbacks', () =>
      HttpResponse.json({ code: 400, message: 'bindException', data: [] }, { status: 400 }),
    ),
  );
  const { result } = renderMutation(false);

  await act(async () => {
    await result.current.mutateAsync({ content: '폼 피드백', channel: 'FORM' }).catch(() => {});
  });

  expect(mockTrackFeedbackSubmitted).not.toHaveBeenCalled();
});
