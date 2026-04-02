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

interface AttendanceRecord {
  id: number;
  status: AttendanceStatus;
  title: string;
  start: string;
  end: string;
  location: string;
}

interface AttendanceSummary {
  attendanceCount: number | null;
  total: number | null;
  absenceCount: number | null;
  attendances: AttendanceRecord[];
}

type AttendanceSummaryResponse = ApiResponse<AttendanceSummary>;

export type {
  AttendanceStatus,
  AttendanceData,
  AttendanceResponse,
  AttendanceRecord,
  AttendanceSummary,
  AttendanceSummaryResponse,
};
