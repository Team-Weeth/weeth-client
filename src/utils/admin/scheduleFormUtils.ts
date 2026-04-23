import type { Schedule } from '@/types/admin/schedule';
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

export function toInitialSessionForm(target: AdminSession | AdminSessionGroup): ScheduleFormState {
  if (isSessionGroup(target)) {
    return {
      title: target.title,
      startDate: target.startDate,
      startTime: '00:00',
      endDate: target.endDate,
      endTime: '23:59',
      location: '',
      content: '',
    };
  }
  return {
    title: target.title,
    startDate: target.start.slice(0, 10),
    startTime: target.start.slice(11, 16),
    endDate: target.end.slice(0, 10),
    endTime: target.end.slice(11, 16),
    location: '',
    content: '',
  };
}

export function toInitialScheduleForm(schedule: Schedule): ScheduleFormState {
  return {
    title: schedule.title,
    startDate: schedule.start.slice(0, 10),
    startTime: schedule.start.slice(11, 16),
    endDate: schedule.end.slice(0, 10),
    endTime: schedule.end.slice(11, 16),
    location: schedule.location,
    content: '',
  };
}

export function isFormChanged(a: ScheduleFormState, b: ScheduleFormState): boolean {
  return (Object.keys(a) as (keyof ScheduleFormState)[]).some((key) => a[key] !== b[key]);
}
