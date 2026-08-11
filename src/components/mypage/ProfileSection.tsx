'use client';

import { Fragment } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/ui';
import ArrowRightIcon from '@/assets/icons/arrow_right.svg';
import PhoneIcon from '@/assets/icons/phone.svg';
import MailIcon from '@/assets/icons/mail.svg';
import { useProfileSectionActions } from '@/hooks/mypage';
import { cn } from '@/lib/cn';
import type { ProfileData } from '@/types/mypage';
import { formatPhone } from '@/utils/shared';
import { ProfileBackgroundImageEditor } from './edit/ProfileBackgroundImageEditor';
import { ProfileImageEditor } from './edit/ProfileImageEditor';
import { MyPageDropdownMenu } from './MyPageDropdownMenu';

interface ProfileSectionProps extends React.HTMLAttributes<HTMLDivElement>, ProfileData {
  postCount?: number;
  sessionCount?: number;
}

const ProfileSection = ({
  profileId,
  name,
  bio,
  profileImageUrl,
  headerImageUrl,
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
  const {
    handleProfileImageChange,
    handleHeaderImageChange,
    handleProfileImageReset,
    handleHeaderImageReset,
  } = useProfileSectionActions({
    profileId,
    name,
    bio,
  });
  const schoolLabel = [school, department].filter(Boolean).join(' · ');
  const activityItems = [
    {
      label: '내가 쓴 글',
      count: postCount,
      href: `/${clubId}/mypage/posts`,
    },
    {
      label: '출석한 세션',
      count: sessionCount,
      href: `/${clubId}/mypage/sessions`,
    },
  ] as const;

  return (
    <div
      className={cn('bg-container-neutral w-full overflow-hidden rounded-lg', className)}
      {...props}
    >
      <ProfileBackgroundImageEditor
        backgroundImageUrl={headerImageUrl}
        onFileChange={(file) => {
          void handleHeaderImageChange(file);
        }}
        onResetImage={() => {
          void handleHeaderImageReset();
        }}
        priority
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
            onFileChange={(file) => {
              void handleProfileImageChange(file);
            }}
            onResetImage={() => {
              void handleProfileImageReset();
            }}
            avatarSize={100}
            avatarClassName="border-line tablet:size-32 border-2"
            triggerClassName="right-0 bottom-0 size-8 border-line"
            triggerIconSize={19}
          />

          <div className="tablet:mb-[6px] tablet:flex hidden items-center">
            <MyPageDropdownMenu />
          </div>
        </div>

        <div className="mt-[10px] flex flex-col">
          <div className="flex items-center justify-between gap-400">
            <div className="flex w-full items-center justify-between">
              <h1 className="typo-h3 text-text-strong">{name}</h1>
              {schoolLabel && (
                <span className="desktop:flex typo-caption2 text-text-alternative bg-container-neutral-alternative hidden shrink-0 rounded-md px-2 py-1">
                  {schoolLabel}
                </span>
              )}
              <div className="tablet:hidden flex">
                <MyPageDropdownMenu />
              </div>
            </div>
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
                  {formatPhone(tel)}
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
          {schoolLabel && (
            <span className="desktop:hidden typo-caption2 text-text-alternative bg-container-neutral-alternative mt-3 flex w-fit shrink-0 items-center justify-center rounded-md px-2 py-1">
              {schoolLabel}
            </span>
          )}
        </div>

        <div className="bg-container-neutral-alternative mt-5 flex h-[112px] items-center justify-center overflow-hidden rounded-md">
          {activityItems.map((item, index) => (
            <Fragment key={item.label}>
              {index > 0 && <div className="bg-button-neutral-interaction h-[80px] w-px" />}
              <button
                type="button"
                className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 py-200"
                onClick={() => router.push(item.href)}
              >
                <span className="tablet:typo-sub3 typo-button2 text-text-alternative flex items-center gap-2">
                  {item.label}
                  <div className="bg-icon-alternative flex size-[18px] items-center justify-center rounded-full">
                    <Icon
                      src={ArrowRightIcon}
                      alt=""
                      size={8}
                      className="text-icon-inverse pl-[1px]"
                    />
                  </div>
                </span>
                <span className="tablet:typo-h3 typo-sub1 text-text-strong">{item.count}개</span>
              </button>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export { ProfileSection, type ProfileSectionProps };
