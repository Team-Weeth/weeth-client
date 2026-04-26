export type ScheduleType = 'SESSION' | 'EVENT';

export interface Schedule {
  id: number;
  title: string;
  type: ScheduleType;
  start: string;
  end: string;
  location: string;
  cardinal: number;
}

export interface ScheduleDetail extends Schedule {
  content: string;
  name: string;
  createdAt: string;
  modifiedAt: string;
}

export interface CreateEventBody {
  title: string;
  content: string;
  location: string;
  cardinal: number;
  start: string;
  end: string;
}

export interface UpdateEventBody {
  title: string;
  content: string;
  location: string;
  start: string;
  end: string;
}
