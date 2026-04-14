'use client';

// import Image from 'next/image';
import { useRouter } from 'next/navigation';
// import { ArrowRightIcon } from '@/assets/icons';
import { useMonthlySchedulesQuery } from '@/hooks/home';
import { EmptyBox } from '@/components/home/EmptyBox';
import { formatKoreanDate, formatKoreanTimeRange, groupByStartDate } from '@/utils/shared/date';
import { useIsAdmin } from '@/hooks/shared';

export function CalendarBox() {
  const router = useRouter();
  const { data: schedules, isPending: isSchedulesPending } = useMonthlySchedulesQuery();
  const { isAdmin, isPending: isAdminPending } = useIsAdmin();

  const now = new Date();
  const monthLabel = `${now.getMonth() + 1}월 캘린더`;
  const dateGrouped = groupByStartDate(schedules ?? []);
  const isLoading = isSchedulesPending || isAdminPending;

  return (
    <div className="bg-container-neutral rounded-lg">
      <div className="typo-sub1 text-text-strong flex justify-between p-450">
        <p className="typo-sub1 text-text-strong">{monthLabel}</p>
        {/* <button type="button" aria-label="캘린더 전체보기" onClick={() => router.push('/calendar')}>
          <Image
            src={ArrowRightIcon}
            alt=""
            aria-hidden="true"
            width={16}
            height={16}
            className="cursor-pointer px-[6px] py-1"
          />
        </button> */}
      </div>
      <div className="flex flex-col gap-400 p-450">
        {isLoading ? null : dateGrouped.length > 0 ? (
          dateGrouped.map(([dateKey, daySchedules]) => (
            <div key={dateKey} className="flex flex-col gap-200">
              <p className="typo-sub2 text-text-strong">
                {formatKoreanDate(daySchedules[0].start)}
              </p>
              {daySchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-container-neutral-alternative flex gap-[10px] rounded-md py-[10px] pl-[5px]"
                >
                  <div className="bg-brand-primary h-[45px] w-[5px] rounded-xl" />
                  <div className="flex flex-col gap-[5px]">
                    <p className="typo-body1 text-text-strong">{schedule.title}</p>
                    <p className="typo-caption2 text-text-alternative">
                      {formatKoreanTimeRange(schedule.start, schedule.end)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : isAdmin ? (
          <EmptyBox
            description="아직 일정 정보가 없습니다."
            button={{ label: '일정 추가하기', onClick: () => router.push('/admin/schedule') }}
          />
        ) : (
          <EmptyBox description="일정이 없습니다." />
        )}
      </div>
    </div>
  );
}
