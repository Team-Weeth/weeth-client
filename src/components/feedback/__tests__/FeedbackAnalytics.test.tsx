import { render } from '@testing-library/react';
import posthog from 'posthog-js';

import { FeedbackAnalytics } from '@/components/feedback/FeedbackAnalytics';
import { DEFAULT_CLUB_FEATURES } from '@/flags/club-features/definitions';
import { ClubFeatureProvider } from '@/providers/club-feature-provider';

jest.mock('posthog-js', () => ({
  __esModule: true,
  default: { __loaded: true, identify: jest.fn(), register: jest.fn(), capture: jest.fn() },
}));

const mockPosthog = jest.mocked(posthog);

function renderWithFlag(feedbackFabEnabled: boolean, clubId = 'club-1') {
  return (
    <ClubFeatureProvider features={{ ...DEFAULT_CLUB_FEATURES, feedbackFabEnabled }}>
      <FeedbackAnalytics userId={7} clubId={clubId} />
    </ClubFeatureProvider>
  );
}

beforeEach(() => {
  mockPosthog.__loaded = true;
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

  expect(mockPosthog.identify).toHaveBeenCalledWith('7');
  expect(mockPosthog.register).toHaveBeenCalledWith({
    club_id: 'club-1',
    feedback_variant: variant,
  });
});

it('동아리가 바뀌면 새 동아리와 그룹으로 다시 등록한다', () => {
  const { rerender } = render(renderWithFlag(true, 'club-1'));
  rerender(renderWithFlag(false, 'club-2'));

  expect(mockPosthog.register).toHaveBeenLastCalledWith({
    club_id: 'club-2',
    feedback_variant: 'settings',
  });
});

it('Provider 밖에서는 기본값인 settings 그룹으로 등록한다', () => {
  render(<FeedbackAnalytics userId={7} clubId="club-1" />);

  expect(mockPosthog.register).toHaveBeenCalledWith({
    club_id: 'club-1',
    feedback_variant: 'settings',
  });
});

it('PostHog가 초기화되지 않았으면 아무것도 호출하지 않는다', () => {
  mockPosthog.__loaded = false;

  render(renderWithFlag(true));

  expect(mockPosthog.identify).not.toHaveBeenCalled();
  expect(mockPosthog.register).not.toHaveBeenCalled();
});
