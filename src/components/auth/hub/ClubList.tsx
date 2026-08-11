'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { ClubAvatar } from '@/components/ui/ClubAvatar';
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { setClubCookie } from '@/lib/actions/club';
import { cn } from '@/lib/cn';
import { useClubActions } from '@/stores';
import type { ClubDto } from '@/types/mypage';

interface ClubListProps extends React.HTMLAttributes<HTMLDivElement> {
  clubs: ClubDto[];
}

function ClubList({ clubs, className, ...props }: ClubListProps) {
  const router = useRouter();
  const { setClub } = useClubActions();

  async function handleSelect(club: ClubDto) {
    await setClubCookie(club.id, club.name);
    setClub(club.id, club.name);
    router.push(`/${club.id}/home`);
  }

  if (!clubs.length) return null;

  return (
    <div className={cn('flex flex-col gap-300', className)} {...props}>
      {clubs.map((club) => (
        <Item
          key={club.id}
          className="border-line bg-background-2 flex-nowrap gap-400 rounded-lg border p-200"
        >
          <ItemMedia>
            <ClubAvatar size={56} src={club.profileImageUrl} name={club.name} />
          </ItemMedia>
          <ItemContent className="min-w-0">
            <ItemTitle className="typo-sub3 text-text-strong">{club.name}</ItemTitle>
            <ItemDescription className="typo-body2 text-text-normal">
              {club.description}
            </ItemDescription>
          </ItemContent>
          <ItemActions className="shrink-0">
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleSelect(club)}
              className="w-19 justify-center px-400 py-300 whitespace-nowrap"
            >
              바로가기
            </Button>
          </ItemActions>
        </Item>
      ))}
    </div>
  );
}

export { ClubList, type ClubListProps };
