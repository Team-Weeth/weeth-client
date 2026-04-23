export type ScheduleType = 'SESSION' | 'GENERAL';

export interface Schedule {
  scheduleId: number;
  title: string;
  type: ScheduleType;
  startDateTime: string;
  endDateTime: string;
  location: string;
  cardinalNumber: number;
}

export interface CreateEventBody {
  title: string;
  content: string;
  location: string;
  cardinal: number;
  start: string;
  end: string;
}
