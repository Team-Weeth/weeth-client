'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { BackIcon, EmptyListIcon } from '@/assets/icons';
import { Icon, Tag } from '@/components/ui';
import { PenaltyRulesDialog } from '@/components/mypage/PenaltyRulesDialog';
import { useIntersectionObserver } from '@/hooks/board/useIntersectionObserver';
import { useMyPagePenaltiesQuery } from '@/hooks/queries/mypage/useMyPagePenaltiesQuery';
import { cn } from '@/lib/cn';
import { parseApiError } from '@/lib/error';
import { toastError } from '@/stores/useToastStore';
import { MyPagePenaltiesSkeleton } from '@/components/mypage/skeleton';

type MyPagePenaltiesContentProps = React.HTMLAttributes<HTMLDivElement>;

function MyPagePenaltiesContent({ className, ...props }: MyPagePenaltiesContentProps) {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const {
    data: penalties = [],
    isPending,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyPagePenaltiesQuery(clubId);
  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver({ rootMargin: '200px' });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isIntersecting]);

  useEffect(() => {
    if (!isError || !error) return;
    const parsed = parseApiError(error);
    toastError(parsed?.message ?? '페널티 기록을 불러오지 못했습니다.');
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
        <div className="flex w-full items-center justify-between gap-1">
          <h1 className="tablet:typo-h3 typo-sub1 text-text-normal">페널티</h1>
          <PenaltyRulesDialog clubId={clubId} />
        </div>
      </div>

      {isPending ? (
        <MyPagePenaltiesSkeleton />
      ) : isError ? (
        <main className="flex min-w-0 flex-1 flex-col items-center justify-center gap-300 py-800">
          <p className="typo-body1 text-text-alternative">페널티 기록을 불러오지 못했습니다</p>
          <button
            type="button"
            className="typo-button2 text-brand-primary"
            onClick={() => refetch()}
          >
            다시 시도
          </button>
        </main>
      ) : penalties.length === 0 ? (
        <section className="flex min-h-[520px] w-full flex-col items-center justify-center gap-[10px] py-300 text-center">
          <Image src={EmptyListIcon} width={226} height={226} alt="empty list" aria-hidden />
          <div className="flex flex-col items-center gap-[10px]">
            <h2 className="typo-h3 text-text-alternative">
              아직 페널티가
              <br />
              기록되지 않았나봐요!
            </h2>
            <div className="text-text-alternative flex items-center justify-center gap-[10px]">
              <span className="typo-body2">혹시 문제가 발생했나요?</span>
              <a href="mailto:contact@weeth.kr" className="typo-button2">
                문의하기
              </a>
            </div>
          </div>
        </section>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col gap-400">
          <div className="bg-container-neutral divide-line divide-y overflow-hidden rounded-lg">
            {penalties.map((penalty) => {
              const date = new Date(penalty.createdAt);
              const dateLabel = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
              const isPenalty = penalty.penaltyType === 'PENALTY';

              return (
                <div key={penalty.penaltyId} className="flex items-center gap-400 px-500 py-400">
                  <div className="w-[60px] self-start">
                    <Tag variant={isPenalty ? 'error' : 'caution'}>
                      {isPenalty ? '페널티' : '경고'}
                    </Tag>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-100">
                    <p className="tablet:typo-sub1 typo-sub3 text-text-strong">
                      {penalty.penaltyDescription}
                    </p>
                    <span className="tablet:typo-body2 typo-caption1 text-text-alternative">
                      {dateLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {isFetchingNextPage && <MyPagePenaltiesSkeleton />}
          <div ref={sentinelRef} />
        </div>
      )}
    </div>
  );
}

export { MyPagePenaltiesContent, type MyPagePenaltiesContentProps };
