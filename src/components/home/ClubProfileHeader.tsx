import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useHomeQuery } from '@/hooks/home';

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
        <AvatarImage
          src={club?.profileImageUrl ?? undefined}
          alt="clubImage"
          className="object-cover"
        />
        <AvatarFallback variant="club" />
      </Avatar>
      <div className="flex w-[172px] flex-col justify-center gap-[2px]">
        <p className="text-text-strong typo-sub1">{club?.name}</p>
        <p className="text-text-normal typo-body2">{club?.description}</p>
      </div>
    </div>
  );
}
