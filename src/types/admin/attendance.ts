export type AttendanceStatus = 'PENDING' | 'ATTEND' | 'ABSENT';

export interface AttendanceMember {
  id: number;
  name: string;
  department: string;
  studentId: string;
  status: AttendanceStatus;
}
