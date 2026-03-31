import { BasicAvatarIcon } from '@/assets/icons';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { useHomeQuery } from '@/hooks/home';
import Image from 'next/image';

export function ClubProfileHeader() {
  const { data: club } = useHomeQuery({
    select: (data) => ({
      profileImageUrl: data.club.profileImageUrl,
      name: data.club.name,
      description: data.club.description,
    }),
  });

  return (
    <div className="flex items-center gap-4 px-200 py-300">
      <Avatar type="square">
        {club?.profileImageUrl ? (
          <AvatarImage width={64} height={64} alt="clubImage" src={club.profileImageUrl} />
        ) : (
          <AvatarFallback>
            <Image src={BasicAvatarIcon} width={64} height={64} alt="기본 프로필" />
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex w-[172px] flex-col justify-center gap-[2px]">
        <p className="text-text-strong typo-sub1">{club?.name}</p>
        <p className="text-text-normal typo-body2">{club?.description}</p>
      </div>
    </div>
  );
}
