import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { ScheduleDetail } from '@/types/calendar';

function useCalendarUrlSync(
  openScheduleDetail: (s: ScheduleDetail) => void,
  closeScheduleDetail: () => void,
  reset: () => void,
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 딥링크: 마운트 시 URL 파라미터로 일정 상세 자동 오픈
  useEffect(() => {
    const idParam = searchParams.get('id');
    const typeParam = searchParams.get('type');
    if (idParam && (typeParam === 'SESSION' || typeParam === 'EVENT')) {
      openScheduleDetail({ id: Number(idParam), type: typeParam, title: '', start: '', end: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildUrlWithoutSchedule = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('id');
    params.delete('type');
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const handleOpenScheduleDetail = (schedule: ScheduleDetail) => {
    openScheduleDetail(schedule);
    const params = new URLSearchParams(searchParams.toString());
    params.set('id', String(schedule.id));
    params.set('type', schedule.type);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleCloseScheduleDetail = () => {
    closeScheduleDetail();
    router.replace(buildUrlWithoutSchedule());
  };

  const handleReset = () => {
    reset();
    router.replace(buildUrlWithoutSchedule());
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return {
    handleOpenScheduleDetail,
    handleCloseScheduleDetail,
    handleReset,
    handleShare,
  };
}

export { useCalendarUrlSync };
