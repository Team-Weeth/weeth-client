import { CalendarMain } from '@/components/calendar/CalendarMain';

// TODO: 캘린더 출석 요약 연결
// 1. params에서 clubId 추출 ({ params }: { params: Promise<{ clubId: string }> })
// 2. attendanceServerApi.getDetail(clubId) 호출
// 3. summary.data.attendanceCount / summary.data.total 로 attendanceRate 계산
// 4. <CalendarMain attendanceRate={...} totalCount={...} /> 형태로 전달
export default function CalendarPage() {
  return <CalendarMain />;
}
