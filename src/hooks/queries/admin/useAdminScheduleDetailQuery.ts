import { useQuery } from '@tanstack/react-query';
import { scheduleApi } from '@/lib/apis/schedule';
import { useClubId } from '@/stores';
import { scheduleQueryKeys } from '@/hooks/queries/schedule/scheduleQueryKeys';
import { toUiScheduleDetail } from '@/utils/calendar/calendarScheduleMapper';
import { toCalendarScheduleDetail } from '@/utils/admin/scheduleUtils';
import type { Schedule } from '@/types/admin/schedule';

/**
 * 어드민 모바일 일정 상세 화면용 데이터.
 * 어드민 전용 상세 API가 없어 사용자 캘린더와 같은 상세 API로 주최·참석자·설명을 채운다.
 * 응답 전이나 실패 시에는 목록 데이터(제목·일시·장소)로 대체한다.
 */
function useAdminScheduleDetailQuery(schedule: Schedule) {
  const clubId = useClubId();

  const { data, isLoading } = useQuery({
    queryKey: scheduleQueryKeys.detail(clubId, schedule.id, schedule.type),
    queryFn: () =>
      scheduleApi.getDetail(clubId!, schedule.id, schedule.type).then((res) => res.data.data),
    enabled: !!clubId,
    // 어드민 수정·삭제 뮤테이션은 이 키를 무효화하지 않으므로, 상세를 열 때마다 최신 데이터를 다시 받는다.
    staleTime: 0,
  });

  return {
    clubId,
    detail: data ? toUiScheduleDetail(data, clubId) : toCalendarScheduleDetail(schedule),
    isLoading,
  };
}

export { useAdminScheduleDetailQuery };
