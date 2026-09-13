import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { copyTextToClipboard } from '@/utils/shared/clipboard';
import { useCalendarSelectedSchedule } from '@/stores/useCalendarStore';
import type { ScheduleDetail } from '@/types/calendar';

function useCalendarUrlSync(
  openScheduleDetail: (s: ScheduleDetail) => void,
  closeScheduleDetail: () => void,
  reset: () => void,
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedSchedule = useCalendarSelectedSchedule();

  // 딥링크: searchParams 변경 시 URL 파라미터로 일정 상세 동기화
  useEffect(() => {
    const idParam = searchParams.get('id');
    const typeParam = searchParams.get('type');
    if (idParam && (typeParam === 'SESSION' || typeParam === 'EVENT')) {
      const id = Number(idParam);
      if (!Number.isSafeInteger(id) || id <= 0) return;
      if (selectedSchedule?.id === id) return;
      openScheduleDetail({ id, type: typeParam, title: '', start: '', end: '' });
    }
  }, [searchParams, openScheduleDetail, selectedSchedule]);

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
    copyTextToClipboard(window.location.href, { successMessage: '일정 링크가 복사되었습니다.' });
  };

  return {
    handleOpenScheduleDetail,
    handleCloseScheduleDetail,
    handleReset,
    handleShare,
  };
}

export { useCalendarUrlSync };
