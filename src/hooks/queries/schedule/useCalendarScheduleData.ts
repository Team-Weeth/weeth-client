import { useQuery } from '@tanstack/react-query';
import { scheduleApi } from '@/lib/apis/schedule';
import { useClubId } from '@/stores';
import {
  useCalendarYear,
  useCalendarMonth,
  useCalendarFilters,
  useCalendarSelectedDate,
  useCalendarSelectedSchedule,
} from '@/stores/useCalendarStore';
import { useMonthlySchedulesQuery } from '@/hooks/queries/schedule/useScheduleQueries';
import { toBaseUiSchedule, toUiScheduleDetail } from '@/components/calendar/calendarScheduleMapper';
import { toDateInputValue } from '@/utils/shared/date';
import { scheduleQueryKeys } from './scheduleQueryKeys';

function useCalendarScheduleData(cardinalNumber: number | undefined) {
  const clubId = useClubId();
  const year = useCalendarYear();
  const month = useCalendarMonth();
  const selectedDate = useCalendarSelectedDate();
  const { sessionEnabled, eventEnabled, attendanceOnly } = useCalendarFilters();
  const selectedSchedule = useCalendarSelectedSchedule();

  // 월별 일정 목록
  const { data: rawSchedules = [] } = useMonthlySchedulesQuery(year, month, cardinalNumber);

  // 선택된 일정의 상세 정보 — selectedSchedule이 있을 때만 fetch
  const { data: apiDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: scheduleQueryKeys.detail(
      clubId,
      selectedSchedule?.id ?? null,
      selectedSchedule?.type ?? null,
    ),
    queryFn: () =>
      scheduleApi
        .getDetail(clubId!, selectedSchedule!.id, selectedSchedule!.type)
        .then((res) => res.data.data),
    enabled: !!clubId && selectedSchedule !== null,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // 상세 데이터가 오면 풍부한 UI 타입으로 변환, 로딩 중에는 기본 목록 데이터 사용
  const fullDetail = apiDetail ? toUiScheduleDetail(apiDetail, clubId) : selectedSchedule;

  const schedules = rawSchedules.map(toBaseUiSchedule);

  const filteredSchedules = schedules.filter((s) => {
    if (attendanceOnly) return s.type === 'SESSION';
    if (s.type === 'SESSION' && !sessionEnabled) return false;
    if (s.type === 'EVENT' && !eventEnabled) return false;
    return true;
  });

  const eventDates = filteredSchedules.map((s) => new Date(s.start));

  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const activeDateStr =
    selectedDate ??
    (isCurrentMonth ? toDateInputValue(now) : `${year}-${String(month).padStart(2, '0')}-01`);
  const selectedDateSchedules = filteredSchedules.filter((s) => s.start.startsWith(activeDateStr));

  const scrollKey = `${year}-${month}-${activeDateStr}`;

  return {
    filteredSchedules,
    eventDates,
    activeDateStr,
    selectedDateSchedules,
    scrollKey,
    fullDetail,
    isDetailLoading,
  };
}

export { useCalendarScheduleData };
