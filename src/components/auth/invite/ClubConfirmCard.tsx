import Image from 'next/image';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { Club } from '@/types';

interface ClubConfirmCardProps {
  club: Club;
  confirmHref: string;
}

function ClubConfirmCard({ club, confirmHref }: ClubConfirmCardProps) {
  return (
    <div className="flex flex-col items-center gap-400">
      <span className="typo-h3 text-text-strong">가입하려는 동아리가 맞나요?</span>
      {club.logoUrl ? (
        <Image
          src={club.logoUrl}
          alt={club.name}
          width={80}
          height={80}
          className="rounded-full object-cover"
        />
      ) : (
        <div className="bg-container-neutral-alternative h-20 w-20 rounded-full" />
      )}
      <div className="mb-400 flex flex-col items-center gap-200">
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
