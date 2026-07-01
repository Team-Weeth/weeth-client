'use client';

import { useParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useMyPageQueries } from '@/hooks/queries/mypage/useMyPageQueries';
import { ProfileSection } from './ProfileSection';
import { ProfileSectionSkeleton } from './skeleton';
import { ActiveClubList } from './ActiveClubList';

type MyPageContentProps = React.HTMLAttributes<HTMLDivElement>;

function MyPageContent({ className, ...props }: MyPageContentProps) {
  const { clubId } = useParams<{ clubId: string }>();
  const [{ data: me }, { data: clubs }] = useMyPageQueries(clubId);
  const displayName = me?.name ?? '';

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-4', className)} {...props}>
      <p className="typo-h3 text-text-normal">프로필</p>
      {me ? (
        <ProfileSection
          name={displayName}
          bio={me.bio ?? undefined}
          profileImageUrl={me.profileImageUrl ?? undefined}
          tel={me.tel ?? undefined}
          email={me.email ?? undefined}
          school={me.school ?? undefined}
          department={me.department ?? undefined}
        />
      ) : (
        <ProfileSectionSkeleton />
      )}
      <ActiveClubList clubs={clubs} clubId={clubId} />
    </div>
  );
}

export { MyPageContent, type MyPageContentProps };
