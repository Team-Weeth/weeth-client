'use client';

import Image from 'next/image';

import { AvatarIcon } from '@/assets/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { useAuthName, useAuthProfileImage } from '@/stores';

interface HubProfileProps extends React.HTMLAttributes<HTMLDivElement> {
  description?: string;
}

function HubProfile({ className, description, ...props }: HubProfileProps) {
  const name = useAuthName();
  const profileImage = useAuthProfileImage();

  return (
    <div className={className} {...props}>
      <Avatar size={128}>
        {profileImage ? (
          <AvatarImage src={profileImage} alt="프로필" />
        ) : (
          <AvatarFallback>
            {name ? name[0] : <Image src={AvatarIcon} alt="프로필" width={80} height={80} />}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="typo-h3 text-text-strong text-center">
        {name ? `${name}님, ` : ''}반가워요!
        <br />
        {description ?? '어떤 동아리 활동을 시작할까요?'}
      </div>
    </div>
  );
}

export { HubProfile };
