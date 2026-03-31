'use client';

// import Image from 'next/image';
// import { useRouter } from 'next/navigation';
// import { ArrowRightIcon } from '@/assets/icons';
import { useMonthlySchedulesQuery } from '@/hooks/home';
import { formatKoreanDate, formatKoreanTimeRange, groupByStartDate } from '@/utils/shared/date';

export function CalendarBox() {
  // const router = useRouter();
  const { data: schedules = [] } = useMonthlySchedulesQuery();

  const now = new Date();
  const monthLabel = `${now.getMonth() + 1}월 캘린더`;
  const dateGrouped = groupByStartDate(schedules);

  return (
    <div className="bg-container-neutral rounded-lg">
      <div className="typo-sub1 text-text-strong flex justify-between p-450">
        <p className="typo-sub1 text-text-strong">{monthLabel}</p>
        {/* <button onClick={() => router.push('/notice')}>
          <Image
            src={ArrowRightIcon}
            alt="arrow-right"
            width={16}
            height={16}
            className="cursor-pointer px-[6px] py-1"
          />
        </button> */}
      </div>
      <div className="flex flex-col gap-400 p-450">
        {dateGrouped.map(([dateKey, daySchedules]) => (
          <div key={dateKey} className="flex flex-col gap-200">
            <p className="typo-sub2 text-text-strong">{formatKoreanDate(daySchedules[0].start)}</p>
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
        ))}
      </div>
    </div>
  );
}
