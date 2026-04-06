import { AttendanceHistoryContent } from '@/components/attendance';
import type { AttendanceSummary } from '@/types/attendance';

// TODO: API 연동 시 실제 데이터로 교체
const mockSummary: AttendanceSummary = {
  total: 5,
  attendanceCount: 3,
  absenceCount: 2,
  attendances: [
    {
      id: 5,
      status: 'ABSENT',
      title: '5주차 정기모임',
      start: '2026-02-23T10:00:00.000Z',
      end: '2026-02-23T12:00:00.000Z',
      location: '공학관 401호',
    },
    {
      id: 4,
      status: 'ATTEND',
      title: '4주차 정기모임',
      start: '2026-02-16T10:00:00.000Z',
      end: '2026-02-16T12:00:00.000Z',
      location: '공학관 401호',
    },
    {
      id: 3,
      status: 'ABSENT',
      title: '3주차 정기모임',
      start: '2026-02-09T10:00:00.000Z',
      end: '2026-02-09T12:00:00.000Z',
      location: '공학관 401호',
    },
    {
      id: 2,
      status: 'ATTEND',
      title: '2주차 정기모임',
      start: '2026-02-02T10:00:00.000Z',
      end: '2026-02-02T12:00:00.000Z',
      location: '공학관 401호',
    },
    {
      id: 1,
      status: 'ATTEND',
      title: '1주차 정기모임',
      start: '2026-01-26T10:00:00.000Z',
      end: '2026-01-26T12:00:00.000Z',
      location: '공학관 401호',
    },
  ],
};

export default function AttendanceHistoryPage() {
  return <AttendanceHistoryContent summary={mockSummary} />;
}
