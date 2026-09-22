'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BackIcon from '@/assets/icons/back.svg';
import CalendarIcon from '@/assets/icons/calendar.svg';
import { Icon } from '@/components/ui/Icon';
import { Tag } from '@/components/ui/tag';
import { useIntersectionObserver } from '@/hooks/board/useIntersectionObserver';
import { useMyPageSessionsQuery } from '@/hooks/queries/mypage/useMyPageSessionsQuery';
import { cn } from '@/lib/cn';
import { parseApiError } from '@/lib/error';
import { formatTime } from '@/lib/formatTime';
import { toastError } from '@/stores/useToastStore';
import { formatSessionDateParts } from '@/utils/shared/date';
import { BoardContentSkeleton } from '@/components/board/BoardContentSkeleton';

type MyPageSessionsContentProps = React.HTMLAttributes<HTMLDivElement>;

function MyPageSessionsContent({ className, ...props }: MyPageSessionsContentProps) {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const {
    data: sessions = [],
    isPending,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyPageSessionsQuery(clubId);
  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver({ rootMargin: '200px' });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isIntersecting]);

  useEffect(() => {
    if (!isError || !error) return;
    const parsed = parseApiError(error);
    toastError(parsed?.message ?? '출석 기록을 불러오지 못했습니다.');
  }, [error, isError]);

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

      {isPending ? (
        <BoardContentSkeleton />
      ) : isError ? (
        <main className="flex min-w-0 flex-1 flex-col items-center justify-center gap-300 py-800">
          <p className="typo-body1 text-text-alternative">출석 기록을 불러오지 못했습니다</p>
          <button
            type="button"
            className="typo-button2 text-brand-primary"
            onClick={() => refetch()}
          >
            다시 시도
          </button>
        </main>
      ) : sessions.length === 0 ? (
        <div className="bg-container-neutral divide-line divide-y overflow-hidden rounded-lg">
          <p className="typo-body2 text-text-alternative py-400 text-center">
            출석한 세션이 없습니다.
          </p>
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col gap-400">
          <div className="bg-container-neutral divide-line divide-y overflow-hidden rounded-lg">
            {sessions.map((session) => {
              const { day, weekday, timeLabel } = formatSessionDateParts(session.start);
              const timeRangeLabel = `${timeLabel} ~ ${formatTime(new Date(session.end))}`;

              return (
                <div key={session.attendanceId} className="flex items-center gap-400 px-500 py-400">
                  <div className="flex w-[44px] shrink-0 flex-col items-center">
                    <span className="typo-h3 text-text-alternative">{day}</span>
                    <span className="typo-body2 text-text-alternative">{weekday}</span>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <p className="typo-sub3 text-text-strong">{session.sessionTitle}</p>
                    <div className="flex flex-wrap items-center gap-200">
                      <Tag variant="primary">{session.cardinal}기</Tag>
                      <Tag className="text-text-alternative inline-flex items-center gap-100 bg-[#9095991A]">
                        <Icon src={CalendarIcon} size={14} className="text-icon-alternative" />
                        {timeRangeLabel}
                      </Tag>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {isFetchingNextPage && <BoardContentSkeleton />}
          <div ref={sentinelRef} />
        </div>
      )}
    </div>
  );
}

export { MyPageSessionsContent, type MyPageSessionsContentProps };
