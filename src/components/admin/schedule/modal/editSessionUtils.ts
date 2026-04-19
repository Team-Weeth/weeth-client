import type { AdminSession, AdminSessionGroup } from '@/types/admin/session';

import type { ScheduleFormState } from './types';

export function isSessionGroup(
  target: AdminSession | AdminSessionGroup,
): target is AdminSessionGroup {
  return 'groupId' in target;
}

export function toInitialForm(target: AdminSession | AdminSessionGroup): ScheduleFormState {
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

export function isFormChanged(a: ScheduleFormState, b: ScheduleFormState): boolean {
  return (Object.keys(a) as (keyof ScheduleFormState)[]).some((key) => a[key] !== b[key]);
}
