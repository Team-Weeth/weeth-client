import { renderHook } from '@testing-library/react';
import { useAdminSessions } from '@/hooks/queries/admin';
import { useFlattenedSessions } from '@/hooks/admin/useFlattenedSessions';
import type { Session } from '@/types/admin/attendance';

jest.mock('@/hooks/queries/admin', () => ({ useAdminSessions: jest.fn() }));

function createSession(id: number, start: string): Session {
  return { id, cardinal: 1, title: `세션 ${id}`, start, end: start, status: 'OPEN' };
}

const YESTERDAY = createSession(1, '2026-09-21T19:00:00');
const TODAY_MORNING = createSession(2, '2026-09-22T09:00:00');
const TOMORROW = createSession(3, '2026-09-23T19:00:00');
const LAST_WEEK = createSession(4, '2026-09-15T19:00:00');

function mockSessions(thisWeek: Session[], sessions: Session[]) {
  jest.mocked(useAdminSessions).mockReturnValue({
    data: {
      thisWeek,
      sessions: [
        {
          groupId: 1,
          title: '정기모임',
          recurrenceType: 'WEEKLY',
          recurrenceDescription: '매주',
          startDate: '2026-09-15',
          endDate: '2026-09-23',
          completedCount: 1,
          totalCount: 4,
          status: 'IN_PROGRESS',
          sessions,
        },
      ],
    },
  } as ReturnType<typeof useAdminSessions>);
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-09-22T14:00:00'));
});

afterEach(() => {
  jest.useRealTimers();
});

it('날짜가 지난 이번 주 세션에는 이번 주 표시를 하지 않는다', () => {
  mockSessions(
    [YESTERDAY, TODAY_MORNING, TOMORROW],
    [LAST_WEEK, YESTERDAY, TODAY_MORNING, TOMORROW],
  );

  const { result } = renderHook(() => useFlattenedSessions(1));
  const byId = new Map(
    result.current.sessions.map((session) => [session.id, session.isCurrentWeek]),
  );

  expect(byId.get(YESTERDAY.id)).toBe(false);
  // 오늘 시작해 이미 끝난 세션도 날짜 기준으로는 아직 지나지 않았다.
  expect(byId.get(TODAY_MORNING.id)).toBe(true);
  expect(byId.get(TOMORROW.id)).toBe(true);
  expect(byId.get(LAST_WEEK.id)).toBe(false);
});

it('태그가 사라진 세션도 이번 주 묶음 순서는 유지한다', () => {
  mockSessions([YESTERDAY, TOMORROW], [LAST_WEEK, YESTERDAY, TOMORROW]);

  const { result } = renderHook(() => useFlattenedSessions(1));

  expect(result.current.sessions.map((session) => session.id)).toEqual([
    YESTERDAY.id,
    TOMORROW.id,
    LAST_WEEK.id,
  ]);
});

it('이번 주 세션은 thisWeek 순서를 따른다', () => {
  // 두 배열의 순서가 다르면 서버가 정해 준 thisWeek 순서를 따라야 한다.
  mockSessions([TOMORROW, YESTERDAY], [LAST_WEEK, YESTERDAY, TOMORROW]);

  const { result } = renderHook(() => useFlattenedSessions(1));

  expect(result.current.sessions.map((session) => session.id)).toEqual([
    TOMORROW.id,
    YESTERDAY.id,
    LAST_WEEK.id,
  ]);
});
