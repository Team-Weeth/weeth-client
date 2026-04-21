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

  return { sessions, ...rest };
}

export { useFlattenedSessions, type FlattenedSession };
