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
    <div className="flex flex-col items-center">
      <span className="typo-h3 text-text-strong mb-400">가입하려는 동아리가 맞나요?</span>
      {club.logoUrl ? (
        <Image
          src={club.logoUrl}
          alt={club.name}
          width={128}
          height={128}
          className="mb-300 rounded-full object-cover"
        />
      ) : (
        <div className="bg-container-neutral-alternative mb-300 h-32 w-32 rounded-full" />
      )}
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
