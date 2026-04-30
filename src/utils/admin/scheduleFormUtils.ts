import type { ScheduleDetail } from '@/types/admin/schedule';
import type { AdminSession, AdminSessionGroup } from '@/types/admin/session';

import type { ScheduleFormState } from '../../components/admin/schedule/modal/types';

export const SCHEDULE_FIELD_LIMITS = {
  title: 30,
  location: 30,
  content: 500,
} as const;

export function isScheduleTitleValid(title: string): boolean {
  return title.trim().length > 0 && title.length <= SCHEDULE_FIELD_LIMITS.title;
}

export function isScheduleLocationValid(location: string): boolean {
  return location.length <= SCHEDULE_FIELD_LIMITS.location;
}

export function isScheduleContentValid(content: string): boolean {
  return content.length <= SCHEDULE_FIELD_LIMITS.content;
}

export function isSessionGroup(
  target: AdminSession | AdminSessionGroup,
): target is AdminSessionGroup {
  return 'groupId' in target;
}

export function toInitialScheduleForm(detail: ScheduleDetail): ScheduleFormState {
  return {
    title: detail.title,
    startDate: detail.start.slice(0, 10),
    startTime: detail.start.slice(11, 16),
    endDate: detail.end.slice(0, 10),
    endTime: detail.end.slice(11, 16),
    location: detail.location,
    content: detail.content,
  };
}

export function isFormChanged(a: ScheduleFormState, b: ScheduleFormState): boolean {
  return (Object.keys(a) as (keyof ScheduleFormState)[]).some((key) => a[key] !== b[key]);
}
