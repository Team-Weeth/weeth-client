type AttendanceStatus = 'ATTEND' | 'ABSENT' | 'PENDING';

interface AttendanceData {
  attendanceRate: number;
  title: string;
  status: AttendanceStatus;
  code: number;
  start: string;
  end: string;
  location: string;
}

interface AttendanceResponse {
  code: number;
  message: string;
  data: AttendanceData;
}

export type { AttendanceStatus, AttendanceData, AttendanceResponse };
