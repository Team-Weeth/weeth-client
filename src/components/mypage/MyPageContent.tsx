'use client';

import { useParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useMyPageQueries } from '@/hooks/queries/mypage/useMyPageQueries';
import { ProfileSection } from './ProfileSection';
import { ProfileSectionSkeleton } from './skeleton';
import { ActiveClubList } from './ActiveClubList';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../ui';
import { MyPageActivityContent } from './MyPageActivityContent';
import { MyPageSettingsContent } from './MyPageSettingsContent';

type MyPageContentProps = React.HTMLAttributes<HTMLDivElement>;

function MyPageContent({ className, ...props }: MyPageContentProps) {
  const { clubId } = useParams<{ clubId: string }>();
  const [{ data: me }, { data: clubs }] = useMyPageQueries(clubId);
  const displayName = me?.name ?? '';

  const profileSection = me ? (
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
  );

  return (
    <>
      <div className={cn('tablet:flex hidden min-w-0 flex-1 flex-col gap-4', className)} {...props}>
        <p className="typo-h3 text-text-normal">프로필</p>
        {profileSection}
        <ActiveClubList clubs={clubs} clubId={clubId} />
      </div>
      <div
        className={cn('tablet:hidden flex min-w-0 flex-1 flex-col gap-200', className)}
        {...props}
      >
        <div className="flex flex-col gap-200">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="typo-caption1 text-text-alternative">
                  프로필
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <p className="typo-h2 text-text-normal">프로필</p>
        </div>
        <div className="flex flex-col gap-500">
          <div className="flex flex-col gap-4">
            {profileSection}
            <ActiveClubList clubs={clubs} clubId={clubId} />
          </div>
          <div className="flex flex-col gap-4">
            <MyPageActivityContent />
          </div>
          <div className="flex flex-col gap-4">
            <MyPageSettingsContent />
          </div>
        </div>
      </div>
    </>
  );
}

export { MyPageContent, type MyPageContentProps };
