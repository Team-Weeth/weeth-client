import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

import { MyPageSettingsContent } from '@/components/mypage/MyPageSettingsContent';
import { DEFAULT_CLUB_FEATURES } from '@/flags/club-features/definitions';
import { trackFeedbackEntryClicked } from '@/lib/analytics/feedbackEvents';
import { ClubFeatureProvider } from '@/providers/club-feature-provider';

jest.mock('@/hooks/useMediaQuery', () => ({ useMediaQuery: () => false }));
jest.mock('@/hooks/useLogout', () => ({ useLogout: () => jest.fn() }));
jest.mock('@/lib/analytics/feedbackEvents', () => ({
  ...jest.requireActual('@/lib/analytics/feedbackEvents'),
  trackFeedbackEntryClicked: jest.fn(),
}));

const mockTrackFeedbackEntryClicked = jest.mocked(trackFeedbackEntryClicked);

function renderWithFlag(feedbackFabEnabled: boolean) {
  return render(
    <ClubFeatureProvider features={{ ...DEFAULT_CLUB_FEATURES, feedbackFabEnabled }}>
      <MyPageSettingsContent />
    </ClubFeatureProvider>,
  );
}

describe('MyPageSettingsContent 서비스 피드백 항목', () => {
  it('B안(FAB 플래그 OFF)이면 문의 메일 위에 서비스 피드백 항목을 노출한다', () => {
    renderWithFlag(false);

    const feedbackItem = screen.getByRole('button', { name: /서비스 피드백/ });
    const mailItem = screen.getByRole('button', { name: /서비스 문의 메일/ });

    expect(feedbackItem.compareDocumentPosition(mailItem)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('A안(FAB 플래그 ON)이면 서비스 피드백 항목을 숨긴다', () => {
    renderWithFlag(true);

    expect(screen.queryByRole('button', { name: /서비스 피드백/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /서비스 문의 메일/ })).toBeInTheDocument();
  });

  it('항목을 누르면 진입 이벤트를 남기고 피드백 페이지로 이동한다', async () => {
    const user = userEvent.setup();
    renderWithFlag(false);

    await user.click(screen.getByRole('button', { name: /서비스 피드백/ }));

    expect(mockTrackFeedbackEntryClicked).toHaveBeenCalledWith({
      variant: 'settings',
      clubId: 'test-club-id',
    });
    expect(useRouter().push).toHaveBeenCalledWith('/test-club-id/mypage/settings/feedback');
  });
});
