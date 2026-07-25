'use client';

import { useParams } from 'next/navigation';
import { useResponsiveGridColumns } from '@/hooks';
import { cn } from '@/lib/cn';
import { useMyPageQueries } from '@/hooks/queries/mypage/useMyPageQueries';
import { ClubInfoCard } from './ClubInfoCard';

type MyPageActivityContentProps = React.HTMLAttributes<HTMLDivElement>;
const TABLET_CARD_WIDTH = 314;
const TABLET_CARD_GAP = 12;

function MyPageActivityContent({ className, ...props }: MyPageActivityContentProps) {
  const { clubId } = useParams<{ clubId: string }>();
  const { activityClubs } = useMyPageQueries(clubId);
  const hasSingleClub = activityClubs.length === 1;
  const { containerRef, columnCount, isSingleColumn } = useResponsiveGridColumns({
    itemCount: activityClubs.length,
    minColumnWidth: TABLET_CARD_WIDTH,
    gap: TABLET_CARD_GAP,
  });
  const mobileCardClassName = hasSingleClub
    ? 'w-[250px] shrink-0 tablet:w-full desktop:w-[314px]'
    : cn('w-[250px] shrink-0', isSingleColumn ? 'tablet:w-full' : 'tablet:w-[314px]');

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-4', className)} {...props}>
      <p className="typo-h3 text-text-normal">활동정보</p>
      <div ref={containerRef} className="tablet:mx-0 tablet:px-0 -mx-450 pl-450">
        <div
          className={cn(
            'scrollbar-none flex gap-300 overflow-x-auto',
            'tablet:grid tablet:overflow-x-visible',
          )}
          style={{
            gridTemplateColumns: hasSingleClub
              ? 'minmax(0, 1fr)'
              : isSingleColumn
                ? 'minmax(0, 1fr)'
                : `repeat(${columnCount}, 314px)`,
          }}
        >
          {activityClubs.map((club) => (
            <ClubInfoCard key={club.id} club={club} className={mobileCardClassName} />
          ))}
        </div>
      </div>
    </div>
  );
}

export { MyPageActivityContent, type MyPageActivityContentProps };
