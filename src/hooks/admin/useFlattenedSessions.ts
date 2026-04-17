import { useAdminSessions } from '@/hooks/queries/admin';
import type { Session } from '@/types/admin/attendance';

interface FlattenedSession extends Session {
  isCurrentWeek: boolean;
}

function useFlattenedSessions(cardinalNumber: number | null) {
  const { data: sessionData, ...rest } = useAdminSessions(cardinalNumber);

  const sessions: FlattenedSession[] = [];

  if (sessionData) {
    const thisWeekIds = new Set(sessionData.thisWeek.map((s) => s.id));

    for (const group of sessionData.sessions) {
      for (const session of group.sessions) {
        sessions.push({
          ...session,
          isCurrentWeek: thisWeekIds.has(session.id),
        });
      }
    }
  }

  return { sessions, ...rest };
}

export { useFlattenedSessions, type FlattenedSession };
