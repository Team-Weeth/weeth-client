import { useAdminSessions } from '@/hooks/queries/admin';
import type { Session } from '@/types/admin/attendance';
import { computeDDay } from '@/utils/shared/date';

interface FlattenedSession extends Session {
  /** 이번 주 세션이면서 아직 날짜가 지나지 않았을 때만 true */
  isCurrentWeek: boolean;
}

function useFlattenedSessions(cardinalNumber: number | null) {
  const { data: sessionData, ...rest } = useAdminSessions(cardinalNumber);

  const thisWeekOrder = new Map(sessionData?.thisWeek.map((session, index) => [session.id, index]));

  const sessions: FlattenedSession[] =
    sessionData?.sessions.flatMap((group) =>
      group.sessions.map((session) => ({
        ...session,
        // 서버는 주가 끝날 때까지 지난 세션도 thisWeek에 담아주므로, 날짜가 지나면 태그를 떼어낸다.
        isCurrentWeek: thisWeekOrder.has(session.id) && computeDDay(session.start) >= 0,
      })),
    ) ?? [];

  // 이번 주 세션을 서버가 준 thisWeek 순서대로 먼저 표시한다. 나머지는 같은 순위라 응답 순서를 유지한다.
  // 태그가 사라진 뒤에도 목록이 흔들리지 않도록 태그 여부가 아니라 thisWeek 포함 여부로 정렬한다.
  const thisWeekRank = (session: FlattenedSession) =>
    thisWeekOrder.get(session.id) ?? thisWeekOrder.size;
  sessions.sort((a, b) => thisWeekRank(a) - thisWeekRank(b));

  return { sessions, ...rest };
}

export { useFlattenedSessions, type FlattenedSession };
