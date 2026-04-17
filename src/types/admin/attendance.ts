import { AttendanceStatus } from '@/constants/attendance';

export interface AttendanceMember {
  id: number;
  name: string;
  department: string;
  studentId: string;
  status: AttendanceStatus;
}
