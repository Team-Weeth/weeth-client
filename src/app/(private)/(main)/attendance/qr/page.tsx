import { AttendanceQRContent } from '@/components/attendance';

// TODO: API 연동 시 실제 데이터로 교체
function createMockQRData() {
  const now = new Date();
  const end = new Date(now.getTime() + 10 * 60 * 1000); // 10분 후

  return {
    title: '1주차 정기모임',
    code: '123456',
    endTime: end.toISOString(),
  };
}

export default function AttendanceQRPage() {
  const { title, code, endTime } = createMockQRData();
  return <AttendanceQRContent title={title} code={code} endTime={endTime} />;
}
