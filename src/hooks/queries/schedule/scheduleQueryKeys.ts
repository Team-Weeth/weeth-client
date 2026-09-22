import type { ScheduleType } from '@/types/api/schedule';

export const scheduleQueryKeys = {
  all: ['schedules'] as const,

  monthly: (clubId: string | null, year: number, month: number, cardinal: number) =>
    ['schedules', 'monthly', clubId, year, month, cardinal] as const,

  detail: (clubId: string | null, id: number | null, type: ScheduleType | null) =>
    ['schedules', 'detail', clubId, id, type] as const,
};
