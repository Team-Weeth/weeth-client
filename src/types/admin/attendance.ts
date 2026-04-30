import { AttendanceStatus } from '@/constants/attendance';

export interface AttendanceMember {
  id: number;
  name: string;
  department: string;
  studentId: string;
  status: AttendanceStatus;
}

export interface Session {
  id: number;
  cardinal: number;
  title: string;
  start: string;
  end: string;
  status: 'OPEN' | 'CLOSED';
}

export interface SessionGroup {
  groupId: number;
  title: string;
  recurrenceType: string;
  recurrenceDescription: string;
  startDate: string;
  endDate: string;
  completedCount: number;
  totalCount: number;
  status: 'COMPLETED' | 'IN_PROGRESS';
  sessions: Session[];
}

export interface SessionListResponse {
  thisWeek: Session[];
  sessions: SessionGroup[];
}

export interface AttendanceStatusUpdate {
  attendanceId: number;
  status: 'ATTEND' | 'ABSENT';
}
