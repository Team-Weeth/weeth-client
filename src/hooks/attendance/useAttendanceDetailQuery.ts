import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/lib/apis/attendance';
import { useClubId } from '@/stores/useClubStore';

/**
 * 기수별 내 출석 상세 내역.
 * 기수가 정해지기 전에는 요청하지 않는다. (기수 미지정 응답과 지정 응답이 서로 달라
 * 화면에 표시되는 데이터가 한 번 바뀌는 것을 막기 위함)
 */
export function useAttendanceDetailQuery(cardinalNumber?: number) {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['attendance', 'detail', clubId, cardinalNumber],
    queryFn: () => attendanceApi.getDetail(clubId!, cardinalNumber).then((res) => res.data.data),
    enabled: !!clubId && cardinalNumber != null,
  });
}
