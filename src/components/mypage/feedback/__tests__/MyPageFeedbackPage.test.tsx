/** @jest-environment node */

import { notFound } from 'next/navigation';

import MyPageFeedbackPage from '@/app/(private)/[clubId]/(main)/mypage/settings/feedback/page';
import { DEFAULT_CLUB_FEATURES } from '@/flags/club-features/definitions';
import { getClubFeatures } from '@/flags/club-features/server';

jest.mock('server-only', () => ({}));
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
jest.mock('@/flags/club-features/server', () => ({ getClubFeatures: jest.fn() }));
jest.mock('@/components/mypage/feedback/FeedbackPageContent', () => ({
  FeedbackPageContent: () => null,
}));

const mockGetClubFeatures = jest.mocked(getClubFeatures);

function renderPage(clubId = 'club-1') {
  return MyPageFeedbackPage({ params: Promise.resolve({ clubId }) });
}

describe('서비스 피드백 페이지 접근 가드', () => {
  it('A안(FAB 플래그 ON) 동아리는 notFound 처리한다', async () => {
    mockGetClubFeatures.mockResolvedValueOnce({
      ...DEFAULT_CLUB_FEATURES,
      feedbackFabEnabled: true,
    });

    await expect(renderPage()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mockGetClubFeatures).toHaveBeenCalledWith('club-1');
  });

  it('B안(FAB 플래그 OFF) 동아리는 피드백 화면을 렌더링한다', async () => {
    mockGetClubFeatures.mockResolvedValueOnce({
      ...DEFAULT_CLUB_FEATURES,
      feedbackFabEnabled: false,
    });

    await expect(renderPage()).resolves.toBeTruthy();
    expect(notFound).not.toHaveBeenCalled();
  });
});
