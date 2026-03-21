'use client';

import { Home, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

import { Tag } from '@/components/ui';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui';
import { cn } from '@/lib/cn';

import { InfoCard } from './InfoCard';
import { InfoSection } from './InfoSection';
import { ProfileSection } from './ProfileSection';
import { SupportListItem } from './SupportListItem';
import { ThemeToggle } from './ThemeToggle';

// TODO: API 연동 시 실제 데이터로 교체
const MOCK_USER = {
  name: '김위드',
  bio: '잘부탁드립니다.',
  profileImageUrl: '',
  email: 'weeth12@gmail.com',
  phone: '-',
  introduction: '-',
  image: '카카오 기본',
  loginInfo: '카카오 로그인',
  university: '-',
  department: '-',
  studentId: '-',
  club: '가천대 검도부',
  generations: [] as string[],
};

type MyPageContentProps = React.HTMLAttributes<HTMLDivElement>;

function MyPageContent({ className, ...props }: MyPageContentProps) {
  const user = MOCK_USER;

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
              <BreadcrumbLink asChild>
                <Link href="/home">
                  <Home size={16} />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-start gap-200">
          <h1 className="typo-h2 flex-1 text-text-strong">My</h1>
          <button
            type="button"
            className="flex size-[40px] items-center justify-center rounded-sm"
            aria-label="더보기"
          >
            <MoreHorizontal size={24} className="text-icon-normal" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex w-full flex-col gap-700">
        {/* 프로필 */}
        <ProfileSection name={user.name} bio={user.bio} profileImageUrl={user.profileImageUrl} />

        {/* 개인정보 */}
        <InfoSection title="개인정보">
          <div className="flex flex-col gap-300">
            <InfoCard
              items={[
                { label: '이름', value: user.name },
                { label: '소개글', value: user.introduction },
                { label: '연락처', value: user.phone },
                { label: '이메일', value: user.email },
                { label: '이미지', value: user.image },
                { label: '로그인 정보', value: user.loginInfo },
              ]}
            />
            <InfoCard
              items={[
                { label: '학교', value: user.university },
                { label: '학과', value: user.department },
                { label: '학번', value: user.studentId },
              ]}
            />
          </div>
        </InfoSection>

        {/* 활동정보 */}
        <InfoSection title="활동정보">
          <InfoCard
            items={[
              { label: '동아리', value: user.club },
              {
                label: '활동 기수',
                value:
                  user.generations.length > 0 ? (
                    <div className="flex items-center gap-100">
                      {user.generations.map((gen) => (
                        <Tag key={gen} className="bg-container-neutral-interaction text-text-alternative">
                          {gen}
                        </Tag>
                      ))}
                    </div>
                  ) : (
                    <Tag className="bg-container-neutral-interaction text-text-alternative">
                      기수정보 없음
                    </Tag>
                  ),
              },
            ]}
          />
        </InfoSection>

        {/* 서비스 설정 */}
        <InfoSection title="서비스 설정">
          <div className="flex flex-col gap-300 rounded-lg bg-container-neutral p-400">
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
            <SupportListItem title="서비스 이용 약관" variant="link" href="/terms" />
            <SupportListItem title="개인정보 처리방침" variant="link" href="/privacy" />
          </div>
        </InfoSection>
      </div>
    </div>
  );
}

export { MyPageContent, type MyPageContentProps };
