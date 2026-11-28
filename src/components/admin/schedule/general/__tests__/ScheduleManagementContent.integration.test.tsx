import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { ScheduleManagementContent } from '@/components/admin/schedule/general/ScheduleManagementContent';
import { useIsTablet } from '@/hooks/useIsTablet';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import type { Schedule } from '@/types/admin/schedule';

jest.mock('@/stores', () => ({ useClubId: () => 'club-1' }));
jest.mock('@/hooks/useIsTablet', () => ({ useIsTablet: jest.fn(() => false) }));

const mockDeleteSchedule = jest.fn();
jest.mock('@/hooks/queries/admin/useAdminScheduleQueries', () => ({
  useAdminMonthlySchedules: jest.fn(),
  useDeleteSchedule: () => ({ mutate: mockDeleteSchedule }),
}));

jest.mock('@/hooks/useCardinalSelector', () => ({
  useCardinalSelector: () => ({
    cardinals: [],
    selectedCardinalId: null,
    setSelectedCardinalId: jest.fn(),
    activeCardinal: undefined,
    latestCardinal: { cardinalNumber: 7 },
  }),
}));

const mockGoToYearMonth = jest.fn();
jest.mock('@/hooks/useMonthNavigator', () => ({
  useMonthNavigator: () => ({
    year: 2026,
    month: 6,
    prev: jest.fn(),
    next: jest.fn(),
    goToToday: jest.fn(),
    goToYearMonth: mockGoToYearMonth,
  }),
}));

const mockSubmitDeleteSession = jest.fn();
jest.mock('@/hooks/admin/useSessionMutations', () => ({
  useSessionMutations: () => ({
    submitCreate: jest.fn(),
    submitDeleteSession: mockSubmitDeleteSession,
    forceConfirmDialog: null,
  }),
}));

// 모바일 화면 전환·삭제 흐름만 검증한다. 데스크톱 전용 영역과 생성·수정 모달은 렌더링에서 제외해
// 같은 일정이 모바일·데스크톱에 중복으로 그려지지 않게 한다.
jest.mock('@/components/admin/schedule/general/ScheduleManagementHeader', () => ({
  ScheduleManagementHeader: () => null,
}));
jest.mock('@/components/admin/schedule/general/ScheduleFilterChips', () => ({
  ScheduleFilterChips: () => null,
}));
jest.mock('@/components/admin/schedule/general/ScheduleCalendarSection', () => ({
  ScheduleCalendarSection: () => null,
}));
jest.mock('@/components/admin/schedule/modal/CreateScheduleModal', () => ({
  CreateScheduleModal: () => null,
}));
jest.mock('@/components/admin/schedule/modal/EditScheduleModal', () => ({
  EditScheduleModal: () => null,
}));
jest.mock('@/components/admin/schedule/modal/EditSessionModal', () => ({
  EditSessionModal: () => null,
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const scheduleQueries = require('@/hooks/queries/admin/useAdminScheduleQueries');

function todayAt(time: string): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${time}`;
}

function createSchedule(overrides: Partial<Schedule> = {}): Schedule {
  return {
    id: 1,
    title: '팀 회의',
    type: 'EVENT',
    start: todayAt('10:00:00'),
    end: todayAt('12:00:00'),
    location: '회의실 A',
    cardinal: 7,
    ...overrides,
  };
}

function setSchedules(schedules: Schedule[]) {
  scheduleQueries.useAdminMonthlySchedules.mockReturnValue({
    data: schedules,
    isPending: false,
    isError: false,
  });
}

function renderContent() {
  render(<ScheduleManagementContent />, { wrapper: createWrapper(createQueryClient()) });
  return userEvent.setup();
}

async function openMobileDetail(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.click(screen.getByRole('button', { name: new RegExp(title) }));
  await screen.findByRole('heading', { name: '일정 상세' });
}

describe('ScheduleManagementContent (integration)', () => {
  beforeEach(() => {
    jest.mocked(useIsTablet).mockReturnValue(false);
    setSchedules([
      createSchedule(),
      createSchedule({ id: 2, title: '정기 세션', type: 'SESSION', location: '공학관' }),
    ]);
    server.use(
      http.get('/api/proxy/clubs/:clubId/schedules/:id', ({ params, request }) =>
        HttpResponse.json({
          code: 200,
          message: '성공',
          data: {
            id: Number(params.id),
            type: new URL(request.url).searchParams.get('type'),
            title: '상세 일정',
            start: todayAt('10:00:00'),
            end: todayAt('12:00:00'),
            totalAttendees: 0,
            attendees: [],
          },
        }),
      ),
    );
  });

  it('오늘 일정 목록과 하단 바를 표시한다', () => {
    renderContent();

    expect(screen.getByRole('heading', { name: '일정 관리' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /팀 회의/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '일정 모아보기' })).toBeInTheDocument();
  });

  describe('모바일 일정 상세', () => {
    it('일정을 누르면 상세 화면으로 바뀌고 하단 바를 숨긴다', async () => {
      const user = renderContent();

      await openMobileDetail(user, '팀 회의');

      expect(screen.queryByRole('heading', { name: '일정 관리' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: '일정 모아보기' })).not.toBeInTheDocument();
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('뒤로 가기를 누르면 캘린더 화면으로 돌아온다', async () => {
      const user = renderContent();
      await openMobileDetail(user, '팀 회의');

      await user.click(screen.getByRole('button', { name: '뒤로 가기' }));

      expect(screen.getByRole('heading', { name: '일정 관리' })).toBeInTheDocument();
    });

    it('일반 일정을 삭제 확인하면 일정 삭제를 요청한다', async () => {
      const user = renderContent();
      await openMobileDetail(user, '팀 회의');

      await user.click(screen.getByRole('button', { name: '삭제' }));
      expect(
        screen.getByRole('alertdialog', { name: '해당 일반 일정을 삭제하시겠어요?' }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: '삭제' }));

      expect(mockDeleteSchedule).toHaveBeenCalledWith(1, expect.anything());
    });

    it('출석 진행 중인 세션은 삭제 불가 안내를 띄우고 삭제를 요청하지 않는다', async () => {
      const user = renderContent();
      await openMobileDetail(user, '정기 세션');

      await user.click(screen.getByRole('button', { name: '삭제' }));
      expect(
        screen.getByRole('alertdialog', { name: /출석 진행 중인 세션은\s*삭제 할 수 없어요\./ }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: '확인' }));

      expect(mockSubmitDeleteSession).not.toHaveBeenCalled();
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  it('태블릿 이상에서는 일정을 누르면 상세 모달을 연다', async () => {
    jest.mocked(useIsTablet).mockReturnValue(true);
    const user = renderContent();

    await user.click(screen.getByRole('button', { name: /팀 회의/ }));

    expect(screen.getByRole('alertdialog', { name: '팀 회의' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '일정 상세' })).not.toBeInTheDocument();
  });

  describe('월 이동', () => {
    it('연·월을 누르면 월 이동 화면을 열고 하단 바를 숨긴다', async () => {
      const user = renderContent();

      await user.click(screen.getByRole('button', { name: '2026.06, 월 선택' }));

      expect(screen.getByRole('heading', { name: '월 이동' })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: '일정 모아보기' })).not.toBeInTheDocument();
    });

    it('다른 연도로 넘긴 뒤 월을 고르면 그 연·월로 이동하고 캘린더로 돌아온다', async () => {
      const user = renderContent();
      await user.click(screen.getByRole('button', { name: '2026.06, 월 선택' }));

      await user.click(screen.getByRole('button', { name: '다음 연도' }));
      await user.click(screen.getByRole('button', { name: '2027년 3월' }));

      expect(mockGoToYearMonth).toHaveBeenCalledWith(2027, 3);
      expect(screen.getByRole('heading', { name: '일정 관리' })).toBeInTheDocument();
    });
  });
});
