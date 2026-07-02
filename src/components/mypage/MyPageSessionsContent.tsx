'use client';

import { useRouter } from 'next/navigation';
import { BackIcon, LocationIcon, CalendarIcon } from '@/assets/icons';
import { Icon, Tag } from '@/components/ui';
import { cn } from '@/lib/cn';
import { toastError } from '@/stores/useToastStore';
import type { AttendanceSummary } from '@/types/attendance';
import { useEffect } from 'react';
import { formatSessionDateParts } from '@/utils/shared/date';

type MyPageSessionsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  summary?: AttendanceSummary;
  errorMessage?: string;
};

function MyPageSessionsContent({
  summary,
  errorMessage,
  className,
  ...props
}: MyPageSessionsContentProps) {
  const router = useRouter();
  const records = summary?.attendances ?? [];

  useEffect(() => {
    if (errorMessage) toastError(errorMessage);
  }, [errorMessage]);

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-4', className)} {...props}>
      <div className="tablet:py-0 flex items-center gap-1 py-300">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center p-1"
        >
          <Icon src={BackIcon} size={21} className="text-icon-normal p-1" />
        </button>
        <div className="flex flex-col gap-1">
          <h1 className="tablet:typo-h3 typo-sub1 text-text-normal">출석한 세션</h1>
        </div>
      </div>

      <div className="bg-container-neutral divide-line divide-y overflow-hidden rounded-lg">
        {records.length === 0 ? (
          <p className="typo-body2 text-text-alternative py-400 text-center">
            출석한 세션이 없습니다.
          </p>
        ) : (
          records.map((record) => {
            const { day, weekday, timeLabel } = formatSessionDateParts(record.start);

            return (
              <div key={record.id} className="flex items-center gap-400 px-500 py-400">
                <div className="flex w-[44px] shrink-0 flex-col items-center">
                  <span className="typo-h3 text-text-alternative">{day}</span>
                  <span className="typo-body2 text-text-alternative">{weekday}</span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="typo-sub3 text-text-strong">{record.title}</p>
                  <div className="flex flex-wrap items-center gap-200">
                    <Tag variant="primary">세션</Tag>
                    <Tag className="text-text-alternative inline-flex items-center gap-100 bg-[#9095991A]">
                      <Icon src={CalendarIcon} size={14} className="text-icon-alternative" />
                      {timeLabel}
                    </Tag>
                    <Tag className="text-text-alternative inline-flex items-center gap-100 bg-[#9095991A]">
                      <Icon src={LocationIcon} size={14} className="text-icon-alternative" />
                      {record.location}
                    </Tag>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export { MyPageSessionsContent, type MyPageSessionsContentProps };
