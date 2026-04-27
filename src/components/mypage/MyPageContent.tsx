'use client';

import { useParams } from 'next/navigation';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useMyPageQueries } from '@/hooks/queries/mypage/useMyPageQueries';
import { InfoCard } from './InfoCard';
import { InfoSection } from './InfoSection';
import { ProfileSection } from './ProfileSection';
import { SupportListItem } from './SupportListItem';
import { ThemeToggle } from './ThemeToggle';
import { MyPageDropdownMenu } from './MyPageDropdownMenu';
import { ClubInfoCard } from './ClubInfoCard';
import { ProfileSectionSkeleton, InfoCardSkeleton, ClubInfoCardSkeleton } from './skeleton';

type MyPageContentProps = React.HTMLAttributes<HTMLDivElement>;

function MyPageContent({ className, ...props }: MyPageContentProps) {
  const { clubId } = useParams<{ clubId: string }>();
  const [{ data: me, isPending: isMePending }, { data: clubs, isPending: isClubsPending }] =
    useMyPageQueries(clubId);

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-[1088px] flex-col items-center gap-[35px] px-450 pt-450 pb-[80px]',
        className,
      )}
      {...props}
    >
      {/* PageNavigation */}
      <div className="flex w-full flex-col gap-200">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>My</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-start gap-200">
          <h1 className="typo-h2 text-text-strong flex-1">My</h1>
          <MyPageDropdownMenu />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex w-full flex-col gap-700">
        {/* 프로필 */}
        {me ? (
          <ProfileSection
            name={me.name}
            bio={me.bio ?? undefined}
            profileImageUrl={me.profileImageUrl ?? undefined}
          />
        ) : (
          <ProfileSectionSkeleton />
        )}

        {/* 개인정보 */}
        <InfoSection title="개인정보">
          <div className="flex flex-col gap-300">
            {me && !isMePending ? (
              <>
                <InfoCard
                  items={[
                    { label: '이름', value: me.name },
                    { label: '소개글', value: me.bio },
                    {
                      label: '전화번호',
                      value: me.tel?.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') ?? '-',
                    },
                    { label: '이메일', value: me.email },
                  ]}
                />
                <InfoCard
                  items={[
                    { label: '학교', value: me.school },
                    { label: '학과', value: me.department },
                    { label: '학번', value: me.studentId },
                  ]}
                />
              </>
            ) : (
              <>
                <InfoCardSkeleton rows={4} />
                <InfoCardSkeleton rows={3} />
              </>
            )}
          </div>
        </InfoSection>

        {/* 활동정보 */}
        <InfoSection title="활동정보">
          <div className="flex flex-row gap-300">
            {clubs && !isClubsPending
              ? clubs.map((club) => <ClubInfoCard key={club.id} club={club} />)
              : Array.from({ length: 1 }).map((_, index) => <ClubInfoCardSkeleton key={index} />)}
          </div>
        </InfoSection>

        {/* 서비스 설정 */}
        <InfoSection title="서비스 설정">
          <div className="bg-container-neutral flex flex-col gap-300 rounded-lg p-400">
            <div className="flex flex-col gap-100">
              <span className="typo-caption1 text-text-alternative">모드 설정</span>
              <span className="typo-sub1 text-text-strong">다크/라이트 모드</span>
            </div>
            <ThemeToggle />
          </div>
        </InfoSection>

        {/* 고객지원 */}
        <InfoSection title="고객지원">
          <div className="flex flex-col gap-300">
            <SupportListItem
              title="서비스 문의 메일"
              description="help@weeth.kr"
              variant="copy"
              copyText="help@weeth.kr"
            />
            <SupportListItem title="서비스 이용 약관" variant="link" href={`/${clubId}/terms`} />
            <SupportListItem title="개인정보 처리방침" variant="link" href={`/${clubId}/privacy`} />
          </div>
        </InfoSection>
      </div>
    </div>
  );
}

export { MyPageContent, type MyPageContentProps };
