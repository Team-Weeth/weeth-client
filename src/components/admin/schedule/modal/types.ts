import type { SessionRecurrenceType } from '@/types/admin/session';

export interface ScheduleFormState {
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  content: string;
}

export interface SessionFormState {
  selectedCardinalId: number | null;
  recurrenceType: SessionRecurrenceType;
  recurrenceEndDate: string;
}

export type SessionDeleteType = 'this' | 'all';
export type SessionSaveType = 'this' | 'all';

export function isDateRangeValid(form: ScheduleFormState): boolean {
  return (
    form.startDate < form.endDate ||
    (form.startDate === form.endDate && form.startTime < form.endTime)
  );
}
