import Link from 'next/link';

import { buttonVariants } from '@/components/ui';
import { cn } from '@/lib/cn';

function ClubNotFoundPage() {
  return (
    <div className="bg-container-neutral-alternative flex min-h-screen flex-col items-center justify-center gap-500 px-400">
      <h1 className="typo-h3 text-text-strong text-center">존재하지 않는 동아리입니다.</h1>
      <Link
        href="/"
        className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full max-w-80')}
      >
        처음으로 돌아가기
      </Link>
    </div>
  );
}

export { ClubNotFoundPage };
