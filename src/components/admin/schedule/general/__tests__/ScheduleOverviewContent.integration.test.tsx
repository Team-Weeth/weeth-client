import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScheduleOverviewContent } from '@/components/admin/schedule/general/ScheduleOverviewContent';
import type { Schedule } from '@/types/admin/schedule';
import type { AdminSessionGroup } from '@/types/admin/session';

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: () => ({ push: mockPush, back: mockBack }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/stores', () => ({ useClubId: () => 'club-1' }));

const mockDeleteSchedule = jest.fn();
jest.mock('@/hooks/queries/admin/useAdminScheduleQueries', () => ({
  useAdminMonthlySchedules: jest.fn(),
  useAdminMonthlySessionList: jest.fn(),
  useDeleteSchedule: () => ({ mutate: mockDeleteSchedule }),
}));

jest.mock('@/hooks/useCardinalSelector', () => ({
  useCardinalSelector: () => ({
    cardinals: [],
    selectedCardinalId: null,
    setSelectedCardinalId: jest.fn(),
    activeCardinal: { cardinalNumber: 7 },
    latestCardinal: { cardinalNumber: 7 },
  }),
}));

jest.mock('@/hooks/useMonthNavigator', () => ({
  useMonthNavigator: () => ({
    year: 2026,
    month: 6,
    prev: jest.fn(),
    next: jest.fn(),
    goToToday: jest.fn(),
  }),
}));

jest.mock('@/hooks/admin/useSessionMutations', () => ({
  useSessionMutations: () => ({
    submitCreate: jest.fn(),
    forceConfirmDialog: null,
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const scheduleQueries = require('@/hooks/queries/admin/useAdminScheduleQueries');

function createSchedule(overrides: Partial<Schedule> = {}): Schedule {
  return {
    id: 1,
    title: '팀 회의',
    type: 'EVENT',
    start: '2026-06-01T10:00:00',
    end: '2026-06-01T12:00:00',
    location: '회의실 A',
    cardinal: 7,
    ...overrides,
  };
}

function createSessionGroup(overrides: Partial<AdminSessionGroup> = {}): AdminSessionGroup {
  return {
    groupId: 1,
    title: '정기 세션',
    recurrenceType: 'WEEKLY',
    recurrenceDescription: '매주 목요일',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    completedCount: 2,
    totalCount: 4,
    status: 'OPEN',
    sessions: [
      {
        id: 10,
        cardinal: 7,
        title: '1회차',
        start: '2026-06-05T19:00:00',
        end: '2026-06-05T21:00:00',
        status: 'COMPLETED',
      },
    ],
    ...overrides,
  };
}

function setupMocks(options?: {
  schedules?: Schedule[];
  sessionGroups?: AdminSessionGroup[];
  isEventLoading?: boolean;
  isSessionLoading?: boolean;
}) {
  const {
    schedules = [],
    sessionGroups = [],
    isEventLoading = false,
    isSessionLoading = false,
  } = options ?? {};

  scheduleQueries.useAdminMonthlySchedules.mockReturnValue({
    data: schedules,
    isLoading: isEventLoading,
  });
  scheduleQueries.useAdminMonthlySessionList.mockReturnValue({
    data: { thisWeek: [], sessions: sessionGroups },
    isLoading: isSessionLoading,
  });
}

describe('ScheduleOverviewContent (integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('기본 렌더링 시 일반 일정 탭이 활성화된다', () => {
    setupMocks({
      schedules: [createSchedule()],
    });

    render(<ScheduleOverviewContent />);

    // 필터 칩 버튼 존재 확인
    expect(screen.getByRole('button', { name: /일반 일정/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /세션/ })).toBeInTheDocument();
    // 일정 목록 항목 확인
    expect(screen.getByText('팀 회의')).toBeInTheDocument();
  });

  it('세션 탭 클릭 시 세션 목록이 표시된다', async () => {
    const user = userEvent.setup();
    setupMocks({
      schedules: [createSchedule()],
      sessionGroups: [createSessionGroup()],
    });

    render(<ScheduleOverviewContent />);

    await user.click(screen.getByText(/세션/));

    expect(screen.getByText('정기 세션')).toBeInTheDocument();
  });

  it('세션 탭에서 안내 배너가 표시된다', async () => {
    const user = userEvent.setup();
    setupMocks({ sessionGroups: [createSessionGroup()] });

    render(<ScheduleOverviewContent />);

    await user.click(screen.getByText(/세션/));

    expect(screen.getByText(/출석을 진행할 동아리의 공식적인 모임/)).toBeInTheDocument();
  });

  it('검색어를 입력하면 일정이 필터링된다', async () => {
    const user = userEvent.setup();
    setupMocks({
      schedules: [
        createSchedule({ id: 1, title: '팀 회의' }),
        createSchedule({ id: 2, title: '워크샵', location: '강남' }),
      ],
    });

    render(<ScheduleOverviewContent />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '워크샵');

    expect(screen.getByText('워크샵')).toBeInTheDocument();
    expect(screen.queryByText('팀 회의')).not.toBeInTheDocument();
  });

  it('위치로도 검색이 가능하다', async () => {
    const user = userEvent.setup();
    setupMocks({
      schedules: [
        createSchedule({ id: 1, title: '회의', location: '강남 센터' }),
        createSchedule({ id: 2, title: '세미나', location: '판교' }),
      ],
    });

    render(<ScheduleOverviewContent />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '강남');

    expect(screen.getByText('회의')).toBeInTheDocument();
    expect(screen.queryByText('세미나')).not.toBeInTheDocument();
  });

  it('일반 일정 탭에서 생성 버튼 텍스트가 "일정 생성"이다', () => {
    setupMocks();

    render(<ScheduleOverviewContent />);

    expect(screen.getByRole('button', { name: /일정 생성/ })).toBeInTheDocument();
  });

  it('세션 탭에서 생성 버튼 텍스트가 "세션 생성"이다', async () => {
    const user = userEvent.setup();
    setupMocks();

    render(<ScheduleOverviewContent />);

    await user.click(screen.getByText(/세션/));

    expect(screen.getByRole('button', { name: /세션 생성/ })).toBeInTheDocument();
  });

  it('필터 칩에 개수가 표시된다', () => {
    setupMocks({
      schedules: [createSchedule({ id: 1 }), createSchedule({ id: 2 })],
      sessionGroups: [createSessionGroup()],
    });

    render(<ScheduleOverviewContent />);

    expect(screen.getByText(/일반 일정 2/)).toBeInTheDocument();
    expect(screen.getByText(/세션 1/)).toBeInTheDocument();
  });
});
