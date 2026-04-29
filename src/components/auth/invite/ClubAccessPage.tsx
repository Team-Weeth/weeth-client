import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage, buttonVariants } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { Club } from '@/types';

interface ClubAccessPageProps {
  club: Club;
  loginHref?: string;
}

function ClubAccessPage({ club, loginHref }: ClubAccessPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex w-full max-w-[414px] flex-col items-center gap-400 px-400">
        <h1 className="typo-h3 text-text-strong tablet:whitespace-nowrap text-center">
          이 사이트는
          <br className="tablet:hidden" />
          동아리 회원만 이용할 수 있어요.
        </h1>
        <Avatar size={128} type="square" className="border-line rounded-[32px] border-2">
          {club.profileImageUrl && (
            <AvatarImage src={club.profileImageUrl} alt={club.name} className="object-cover" />
          )}
          <AvatarFallback variant="club" />
        </Avatar>
        <div className="flex flex-col items-center gap-200">
          <span className="typo-h3 text-text-strong">{club.name}</span>
          <span className="typo-body2 text-text-normal">{club.description}</span>
        </div>
        {loginHref && (
          <Link
            href={loginHref}
            className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}
          >
            로그인하고 들어가기
          </Link>
        )}
      </div>
    </div>
  );
}

export { ClubAccessPage };
