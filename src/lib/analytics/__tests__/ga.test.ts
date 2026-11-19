import { sendGAEvent } from '@next/third-parties/google';

import { setAnalyticsUser, trackGA } from '@/lib/analytics/ga';

jest.mock('@next/third-parties/google', () => ({ sendGAEvent: jest.fn() }));

const mockSendGAEvent = jest.mocked(sendGAEvent);
const ORIGINAL_APP_ENV = process.env.NEXT_PUBLIC_APP_ENV;

function setAppEnv(value: string | undefined) {
  if (value === undefined) delete process.env.NEXT_PUBLIC_APP_ENV;
  else process.env.NEXT_PUBLIC_APP_ENV = value;
}

afterEach(() => {
  setAppEnv(ORIGINAL_APP_ENV);
  jest.clearAllMocks();
});

describe('프로덕션 환경', () => {
  beforeEach(() => setAppEnv('production'));

  it('trackGA는 event 타입으로 sendGAEvent를 호출한다', () => {
    trackGA('feedback_opened', { variant: 'fab', club_id: 'club-1' });

    expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'feedback_opened', {
      variant: 'fab',
      club_id: 'club-1',
    });
  });

  it('setAnalyticsUser는 user_id와 user_properties를 설정한다', () => {
    setAnalyticsUser({ userId: 7, properties: { club_id: 'club-1', feedback_variant: 'fab' } });

    expect(mockSendGAEvent).toHaveBeenNthCalledWith(1, 'set', { user_id: '7' });
    expect(mockSendGAEvent).toHaveBeenNthCalledWith(2, 'set', 'user_properties', {
      club_id: 'club-1',
      feedback_variant: 'fab',
    });
  });
});

describe('비프로덕션 환경', () => {
  beforeEach(() => setAppEnv('development'));

  it('아무 것도 전송하지 않는다', () => {
    trackGA('feedback_opened', { variant: 'fab', club_id: 'club-1' });
    setAnalyticsUser({ userId: 7, properties: { club_id: 'club-1' } });

    expect(mockSendGAEvent).not.toHaveBeenCalled();
  });
});
