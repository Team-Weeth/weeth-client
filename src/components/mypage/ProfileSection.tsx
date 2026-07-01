'use client';

import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/ui';
import { ArrowRightIcon, PhoneIcon, MailIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';
import type { ProfileData } from '@/types/mypage';
import { ProfileBackgroundImageEditor } from './edit/ProfileBackgroundImageEditor';
import { ProfileImageEditor } from './edit/ProfileImageEditor';
import { MyPageDropdownMenu } from './MyPageDropdownMenu';

interface ProfileSectionProps extends React.HTMLAttributes<HTMLDivElement>, ProfileData {
  postCount?: number;
  sessionCount?: number;
}

const ProfileSection = ({
  name,
  bio,
  profileImageUrl,
  tel,
  email,
  school,
  department,
  postCount = 0,
  sessionCount = 0,
  className,
  ...props
}: ProfileSectionProps) => {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const schoolLabel = [school, department].filter(Boolean).join(' · ');

  return (
    <div
      className={cn('bg-container-neutral w-full overflow-hidden rounded-lg', className)}
      {...props}
    >
      <ProfileBackgroundImageEditor
        className="h-[190px] rounded-none"
        imageClassName="rounded-none"
        triggerClassName="top-[18px] right-[18px] size-8"
        triggerIconSize={19}
      />

      <div className="px-[18px] pb-[22px]">
        <div className="-mt-16 flex items-end justify-between">
          <ProfileImageEditor
            name={name}
            profileImageUrl={profileImageUrl}
            avatarSize={128}
            avatarClassName="border-line border-2"
            triggerClassName="right-0 bottom-0 size-8 border-line"
            triggerIconSize={19}
          />

          <div className="mb-[6px] flex items-center">
            <MyPageDropdownMenu />
          </div>
        </div>

        <div className="mt-[10px] flex flex-col">
          <div className="flex items-center justify-between gap-400">
            <h1 className="typo-h3 text-text-strong">{name}</h1>
            {schoolLabel && (
              <span className="typo-caption2 text-text-alternative bg-container-neutral-alternative shrink-0 rounded-md px-2 py-1">
                {schoolLabel}
              </span>
            )}
          </div>
          {bio && <p className="typo-body2 text-text-alternative mt-1">{bio}</p>}
          {(tel || email) && (
            <div className="mt-[10px] flex flex-wrap gap-[9px]">
              {tel && (
                <span className="typo-body2 text-text-strong flex items-center gap-1">
                  <Icon
                    src={PhoneIcon}
                    alt="전화번호"
                    size={14}
                    className="text-icon-alternative shrink-0"
                  />
                  {tel}
                </span>
              )}
              {email && (
                <span className="typo-body2 text-text-strong flex items-center gap-1">
                  <Icon
                    src={MailIcon}
                    alt="이메일"
                    size={14}
                    className="text-icon-alternative shrink-0"
                  />
                  {email}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="bg-container-neutral-alternative mt-5 flex h-[112px] items-center justify-center overflow-hidden rounded-md">
          <button
            type="button"
            className="flex flex-1 flex-col items-center justify-center gap-2 py-200"
            onClick={() => router.push(`/${clubId}/mypage/posts`)}
          >
            <span className="typo-sub3 text-text-alternative flex items-center gap-2">
              내가 쓴 글
              <div className="bg-icon-alternative flex size-[18px] items-center justify-center rounded-full">
                <Icon src={ArrowRightIcon} alt="" size={8} className="text-icon-inverse pl-[1px]" />
              </div>
            </span>
            <span className="typo-h3 text-text-strong">{postCount}개</span>
          </button>

          <div className="bg-button-neutral-interaction h-[80px] w-px" />

          <button
            type="button"
            className="flex flex-1 flex-col items-center justify-center gap-2 py-200"
            onClick={() => router.push(`/${clubId}/mypage/sessions`)}
          >
            <span className="typo-sub3 text-text-alternative flex items-center gap-2">
              출석한 세션
              <div className="bg-icon-alternative flex size-[18px] items-center justify-center rounded-full">
                <Icon src={ArrowRightIcon} alt="" size={8} className="text-icon-inverse pl-[1px]" />
              </div>
            </span>
            <span className="typo-h3 text-text-strong">{sessionCount}개</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export { ProfileSection, type ProfileSectionProps };
