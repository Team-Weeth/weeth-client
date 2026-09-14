import { useAdminSessions } from '@/hooks/queries/admin';
import type { Session } from '@/types/admin/attendance';

interface FlattenedSession extends Session {
  isCurrentWeek: boolean;
}

function useFlattenedSessions(cardinalNumber: number | null) {
  const { data: sessionData, ...rest } = useAdminSessions(cardinalNumber);

  const thisWeekIds = new Set(sessionData?.thisWeek.map((s) => s.id));

  const sessions: FlattenedSession[] =
    sessionData?.sessions.flatMap((group) =>
      group.sessions.map((session) => ({
        ...session,
        isCurrentWeek: thisWeekIds.has(session.id),
      })),
    ) ?? [];

  // 이번 주 세션을 먼저 표시하고, 같은 우선순위 내에서는 응답 순서를 유지한다.
  sessions.sort((a, b) => Number(b.isCurrentWeek) - Number(a.isCurrentWeek));

  return { sessions, ...rest };
}

export { useFlattenedSessions, type FlattenedSession };
