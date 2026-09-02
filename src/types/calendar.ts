export type CalendarScheduleType = 'SESSION' | 'EVENT';

export interface CalendarSchedule {
  id: number;
  title: string;
  start: string;
  end: string;
  type: CalendarScheduleType;
  location?: string;
}

export type AttendanceStatus = 'pending' | 'available' | 'completed' | 'absent';

export interface AttendeeInfo {
  name: string;
  imageUrl?: string;
}

export interface ScheduleDetail extends CalendarSchedule {
  host?: AttendeeInfo;
  attendees?: AttendeeInfo[];
  attendeeCount?: number;
  showAttendeeCount?: boolean;
  dDay?: number;
  hasAttendanceCheck?: boolean;
  attendanceStatus?: AttendanceStatus;
  attendanceCompletedAt?: string;
  description?: string;
  clubId?: string | null;
}
