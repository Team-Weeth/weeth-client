import type { ApiResponse } from '@/types/common';

type AttendanceStatus = 'ATTEND' | 'ABSENT' | 'PENDING';

interface AttendanceData {
  attendanceRate: number;
  title: string | null;
  status: AttendanceStatus | null;
  code: number | null;
  start: string | null;
  end: string | null;
  location: string | null;
}

type AttendanceResponse = ApiResponse<AttendanceData>;

export type { AttendanceStatus, AttendanceData, AttendanceResponse };
