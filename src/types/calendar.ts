export type CalendarScheduleType = 'SESSION' | 'EVENT';

export interface CalendarSchedule {
  id: number;
  title: string;
  start: string;
  end: string;
  type: CalendarScheduleType;
  location?: string;
}
