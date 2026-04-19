export interface ScheduleFormState {
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  content: string;
}

export type SessionDeleteType = 'this' | 'all';
export type SessionSaveType = 'this' | 'all';
