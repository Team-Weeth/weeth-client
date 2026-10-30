import posthog from 'posthog-js';

import {
  getFeedbackVariant,
  registerFeedbackContext,
  trackFeedbackEntryClicked,
  trackFeedbackOpened,
  trackFeedbackSubmitted,
} from '@/lib/analytics/feedbackEvents';

jest.mock('posthog-js', () => ({
  __esModule: true,
  default: { __loaded: true, identify: jest.fn(), register: jest.fn(), capture: jest.fn() },
}));

const mockPosthog = jest.mocked(posthog);

function setPostHogLoaded(loaded: boolean) {
  mockPosthog.__loaded = loaded;
}

beforeEach(() => setPostHogLoaded(true));

describe('getFeedbackVariant', () => {
  it.each([
    [true, 'fab'],
    [false, 'settings'],
  ] as const)('feedbackFabEnabled=%s 이면 %s 그룹이다', (enabled, variant) => {
    expect(getFeedbackVariant(enabled)).toBe(variant);
  });
});

describe('registerFeedbackContext', () => {
  it('사용자를 식별하고 동아리·그룹을 super property로 등록한다', () => {
    registerFeedbackContext({ userId: 7, clubId: 'club-1', variant: 'fab' });

    expect(mockPosthog.identify).toHaveBeenCalledWith('7');
    expect(mockPosthog.register).toHaveBeenCalledWith({
      club_id: 'club-1',
      feedback_variant: 'fab',
    });
  });
});

describe('feedback events', () => {
  it('진입 클릭과 작성 화면 노출에 그룹과 동아리를 담는다', () => {
    trackFeedbackEntryClicked({ variant: 'settings', clubId: 'club-1' });
    trackFeedbackOpened({ variant: 'settings', clubId: 'club-1' });

    expect(mockPosthog.capture).toHaveBeenNthCalledWith(1, 'feedback_entry_clicked', {
      variant: 'settings',
      club_id: 'club-1',
    });
    expect(mockPosthog.capture).toHaveBeenNthCalledWith(2, 'feedback_opened', {
      variant: 'settings',
      club_id: 'club-1',
    });
  });

  it('제출 이벤트는 채널과 본문 길이만 담고 본문은 보내지 않는다', () => {
    trackFeedbackSubmitted({
      variant: 'fab',
      clubId: 'club-1',
      channel: 'CHAT',
      contentLength: 12,
    });

    expect(mockPosthog.capture).toHaveBeenCalledWith('feedback_submitted', {
      variant: 'fab',
      club_id: 'club-1',
      channel: 'CHAT',
      content_length: 12,
    });
    expect(Object.keys(mockPosthog.capture.mock.calls[0][1] ?? {})).not.toContain('content');
  });
});

describe('PostHog 미초기화', () => {
  it('모든 헬퍼가 SDK를 호출하지 않는다', () => {
    setPostHogLoaded(false);

    registerFeedbackContext({ userId: 7, clubId: 'club-1', variant: 'fab' });
    trackFeedbackEntryClicked({ variant: 'fab', clubId: 'club-1' });
    trackFeedbackOpened({ variant: 'fab', clubId: 'club-1' });
    trackFeedbackSubmitted({ variant: 'fab', clubId: 'club-1', channel: 'CHAT', contentLength: 1 });

    expect(mockPosthog.identify).not.toHaveBeenCalled();
    expect(mockPosthog.register).not.toHaveBeenCalled();
    expect(mockPosthog.capture).not.toHaveBeenCalled();
  });
});
