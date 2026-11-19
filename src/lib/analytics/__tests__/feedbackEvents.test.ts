import { setAnalyticsUser, trackGA } from '@/lib/analytics/ga';
import {
  getFeedbackVariant,
  registerFeedbackContext,
  trackFeedbackEntryClicked,
  trackFeedbackOpened,
  trackFeedbackSubmitted,
} from '@/lib/analytics/feedbackEvents';

jest.mock('@/lib/analytics/ga', () => ({ trackGA: jest.fn(), setAnalyticsUser: jest.fn() }));

const mockTrackGA = jest.mocked(trackGA);
const mockSetAnalyticsUser = jest.mocked(setAnalyticsUser);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getFeedbackVariant', () => {
  it.each([
    [true, 'fab'],
    [false, 'settings'],
  ] as const)('feedbackFabEnabled=%s 이면 %s 그룹이다', (enabled, variant) => {
    expect(getFeedbackVariant(enabled)).toBe(variant);
  });
});

describe('registerFeedbackContext', () => {
  it('사용자 식별자와 동아리·그룹을 user property로 등록한다', () => {
    registerFeedbackContext({ userId: 7, clubId: 'club-1', variant: 'fab' });

    expect(mockSetAnalyticsUser).toHaveBeenCalledWith({
      userId: 7,
      properties: { club_id: 'club-1', feedback_variant: 'fab' },
    });
  });
});

describe('feedback events', () => {
  it('진입 클릭과 작성 화면 노출에 그룹과 동아리를 담는다', () => {
    trackFeedbackEntryClicked({ variant: 'settings', clubId: 'club-1' });
    trackFeedbackOpened({ variant: 'settings', clubId: 'club-1' });

    expect(mockTrackGA).toHaveBeenNthCalledWith(1, 'feedback_entry_clicked', {
      variant: 'settings',
      club_id: 'club-1',
    });
    expect(mockTrackGA).toHaveBeenNthCalledWith(2, 'feedback_opened', {
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

    expect(mockTrackGA).toHaveBeenCalledWith('feedback_submitted', {
      variant: 'fab',
      club_id: 'club-1',
      channel: 'CHAT',
      content_length: 12,
    });
    expect(Object.keys(mockTrackGA.mock.calls[0][1] ?? {})).not.toContain('content');
  });
});
