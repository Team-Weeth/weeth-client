import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage, buttonVariants } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { Club } from '@/types';

interface ClubConfirmCardProps {
  club: Club;
  confirmHref: string;
}

function ClubConfirmCard({ club, confirmHref }: ClubConfirmCardProps) {
  return (
    <div className="flex w-full max-w-[414px] flex-col items-center px-400">
      <span className="typo-h3 text-text-strong mb-400">가입하려는 동아리가 맞나요?</span>
      <Avatar size={128} type="square" className="border-line mb-300 rounded-[32px] border-2">
        {club.profileImageUrl && (
          <AvatarImage src={club.profileImageUrl} alt={club.name} className="object-cover" />
        )}
        <AvatarFallback variant="club" />
      </Avatar>
      <div className="mb-600 flex flex-col items-center gap-200">
        <span className="typo-h3 text-text-strong">{club.name}</span>
        <span className="typo-body2 text-text-normal">{club.description}</span>
      </div>
      <Link
        href={confirmHref}
        className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}
      >
        가입 시작하기
      </Link>
    </div>
  );
}

export { ClubConfirmCard };
