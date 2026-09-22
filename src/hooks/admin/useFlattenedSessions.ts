import { useAdminSessions } from '@/hooks/queries/admin';
import type { Session } from '@/types/admin/attendance';
import { computeDDay } from '@/utils/shared/date';

interface FlattenedSession extends Session {
  /** 이번 주 세션이면서 아직 날짜가 지나지 않았을 때만 true */
  isCurrentWeek: boolean;
}

function useFlattenedSessions(cardinalNumber: number | null) {
  const { data: sessionData, ...rest } = useAdminSessions(cardinalNumber);

  const thisWeekIds = new Set(sessionData?.thisWeek.map((s) => s.id));

  const sessions: FlattenedSession[] =
    sessionData?.sessions.flatMap((group) =>
      group.sessions.map((session) => ({
        ...session,
        // 서버는 주가 끝날 때까지 지난 세션도 thisWeek에 담아주므로, 날짜가 지나면 태그를 떼어낸다.
        isCurrentWeek: thisWeekIds.has(session.id) && computeDDay(session.start) >= 0,
      })),
    ) ?? [];

  // 이번 주 세션을 먼저 표시하고, 같은 우선순위 내에서는 응답 순서를 유지한다.
  // 태그가 사라진 뒤에도 목록 순서는 흔들리지 않도록 서버가 준 thisWeek 기준으로 정렬한다.
  sessions.sort((a, b) => Number(thisWeekIds.has(b.id)) - Number(thisWeekIds.has(a.id)));

  return { sessions, ...rest };
}

export { useFlattenedSessions, type FlattenedSession };
