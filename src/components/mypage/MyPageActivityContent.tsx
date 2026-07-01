'use client';

import { useParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useMyPageQueries } from '@/hooks/queries/mypage/useMyPageQueries';
import { ClubInfoCard } from './ClubInfoCard';

type MyPageActivityContentProps = React.HTMLAttributes<HTMLDivElement>;

function MyPageActivityContent({ className, ...props }: MyPageActivityContentProps) {
  const { clubId } = useParams<{ clubId: string }>();
  const [, { data: clubs = [] }] = useMyPageQueries(clubId);
  // TODO: UI 확인용 mock 삭제 필요
  const mockUnsetCardinalClub = clubs[0]
    ? {
        ...clubs[0],
        id: 'mock-unset-cardinal',
        name: `${clubs[0].name}`,
        cardinals: [],
      }
    : null;

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-4', className)} {...props}>
      <p className="typo-h3 text-text-normal">활동정보</p>
      <div className="flex flex-wrap gap-4">
        {clubs.map((club) => (
          <ClubInfoCard key={club.id} club={club} />
        ))}
        {mockUnsetCardinalClub && (
          <ClubInfoCard key={mockUnsetCardinalClub.id} club={mockUnsetCardinalClub} />
        )}
      </div>
    </div>
  );
}

export { MyPageActivityContent, type MyPageActivityContentProps };
