import type { ApiResponse } from '@/types/common';

type AttendanceStatus = 'ATTEND' | 'ABSENT' | 'PENDING';

interface AttendanceData {
  attendanceRate: number;
  title: string;
  status: AttendanceStatus;
  code: string;
  start: string;
  end: string;
  location: string;
}

type AttendanceResponse = ApiResponse<AttendanceData>;

export type { AttendanceStatus, AttendanceData, AttendanceResponse };
