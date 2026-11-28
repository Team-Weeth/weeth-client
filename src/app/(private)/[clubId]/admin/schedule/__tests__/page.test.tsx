/** @jest-environment node */

import { redirect } from 'next/navigation';
import { DEFAULT_CLUB_FEATURES } from '@/flags/club-features/definitions';
import { getClubFeatures } from '@/flags/club-features/server';
import { ScheduleManagementContent } from '@/components/admin/schedule/general/ScheduleManagementContent';
import { SchedulePageContent } from '@/components/admin/schedule/general/SchedulePageContent';
import SchedulePage from '../page';
import ScheduleOverviewPage from '../overview/page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));
jest.mock('@/flags/club-features/server', () => ({ getClubFeatures: jest.fn() }));
jest.mock('@/lib/apis/home.server', () => ({
  homeServerApi: {
    getDashboard: jest.fn(() => Promise.resolve({ data: { myInfo: { userInfo: { id: 7 } } } })),
  },
}));
jest.mock('@/components/admin/schedule/general/ScheduleManagementContent', () => ({
  ScheduleManagementContent: () => null,
}));
jest.mock('@/components/admin/schedule/general/SchedulePageContent', () => ({
  SchedulePageContent: () => null,
}));

const mockGetClubFeatures = jest.mocked(getClubFeatures);
const mockRedirect = jest.mocked(redirect);

function props(searchParams: Record<string, string | string[] | undefined> = {}) {
  return {
    params: Promise.resolve({ clubId: 'club-a' }),
    searchParams: Promise.resolve(searchParams),
  };
}

function setAdminScheduleV2(enabled: boolean) {
  mockGetClubFeatures.mockResolvedValue({
    ...DEFAULT_CLUB_FEATURES,
    adminScheduleV2Enabled: enabled,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('일정 관리 개편 플래그 OFF', () => {
  beforeEach(() => setAdminScheduleV2(false));

  it('/admin/schedule에서 tab 쿼리가 있어도 개편 전 목록형 화면을 보여준다', async () => {
    const element = await SchedulePage(props({ tab: 'session' }));

    expect(element.type).toBe(SchedulePageContent);
    expect(mockGetClubFeatures).toHaveBeenCalledWith('club-a', '7');
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('/admin/schedule/overview는 쿼리를 유지한 채 /admin/schedule로 되돌린다', async () => {
    await expect(ScheduleOverviewPage(props({ year: '2026', month: '11' }))).rejects.toThrow(
      'NEXT_REDIRECT',
    );
    expect(mockRedirect).toHaveBeenCalledWith('/club-a/admin/schedule?year=2026&month=11');
  });

  it('/admin/schedule/overview에 쿼리가 없으면 물음표 없이 되돌린다', async () => {
    await expect(ScheduleOverviewPage(props())).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/club-a/admin/schedule');
  });
});

describe('일정 관리 개편 플래그 ON', () => {
  beforeEach(() => setAdminScheduleV2(true));

  it('/admin/schedule에서 캘린더형 일정 관리 화면을 보여준다', async () => {
    const element = await SchedulePage(props());

    expect(element.type).toBe(ScheduleManagementContent);
  });

  it('/admin/schedule의 tab 쿼리는 /admin/schedule/overview로 넘긴다', async () => {
    await expect(SchedulePage(props({ tab: 'session', year: '2026' }))).rejects.toThrow(
      'NEXT_REDIRECT',
    );
    expect(mockRedirect).toHaveBeenCalledWith(
      '/club-a/admin/schedule/overview?tab=session&year=2026',
    );
  });

  it('/admin/schedule/overview에서 목록형 화면을 보여준다', async () => {
    const element = await ScheduleOverviewPage(props());

    expect(element.type).toBe(SchedulePageContent);
  });
});
