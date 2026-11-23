import { render } from '@testing-library/react';

import { FeedbackAnalytics } from '@/components/feedback/FeedbackAnalytics';
import { DEFAULT_CLUB_FEATURES } from '@/flags/club-features/definitions';
import { registerFeedbackContext } from '@/lib/analytics/feedbackEvents';
import { ClubFeatureProvider } from '@/providers/club-feature-provider';

jest.mock('@/lib/analytics/feedbackEvents', () => ({
  ...jest.requireActual('@/lib/analytics/feedbackEvents'),
  registerFeedbackContext: jest.fn(),
}));

const mockRegisterFeedbackContext = jest.mocked(registerFeedbackContext);

function renderWithFlag(feedbackFabEnabled: boolean, clubId = 'club-1') {
  return (
    <ClubFeatureProvider features={{ ...DEFAULT_CLUB_FEATURES, feedbackFabEnabled }}>
      <FeedbackAnalytics userId={7} clubId={clubId} />
    </ClubFeatureProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

it('렌더링 결과가 없다', () => {
  const { container } = render(renderWithFlag(true));
  expect(container).toBeEmptyDOMElement();
});

it.each([
  [true, 'fab'],
  [false, 'settings'],
] as const)('플래그 %s 이면 %s 그룹으로 사용자와 동아리를 등록한다', (enabled, variant) => {
  render(renderWithFlag(enabled));

  expect(mockRegisterFeedbackContext).toHaveBeenCalledWith({
    userId: 7,
    clubId: 'club-1',
    variant,
  });
});

it('동아리가 바뀌면 새 동아리와 그룹으로 다시 등록한다', () => {
  const { rerender } = render(renderWithFlag(true, 'club-1'));
  rerender(renderWithFlag(false, 'club-2'));

  expect(mockRegisterFeedbackContext).toHaveBeenLastCalledWith({
    userId: 7,
    clubId: 'club-2',
    variant: 'settings',
  });
});

it('Provider 밖에서는 기본값인 settings 그룹으로 등록한다', () => {
  render(<FeedbackAnalytics userId={7} clubId="club-1" />);

  expect(mockRegisterFeedbackContext).toHaveBeenCalledWith({
    userId: 7,
    clubId: 'club-1',
    variant: 'settings',
  });
});
