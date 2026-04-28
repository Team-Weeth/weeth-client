import Link from 'next/link';

import { buttonVariants } from '@/components/ui';
import { cn } from '@/lib/cn';

interface ClubErrorPageProps {
  title?: string;
  message?: string;
}

function ClubErrorPage({
  title = '존재하지 않는 동아리입니다.',
  message,
}: ClubErrorPageProps) {
  return (
    <div className="bg-container-neutral-alternative flex min-h-screen flex-col items-center justify-center gap-500 px-400">
      <div className="flex max-w-120 flex-col items-center gap-200 text-center">
        <h1 className="typo-h3 text-text-strong">{title}</h1>
        {message && <p className="typo-body2 text-text-alternative">{message}</p>}
      </div>
      <Link
        href="/"
        className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full max-w-80')}
      >
        처음으로 돌아가기
      </Link>
    </div>
  );
}

export { ClubErrorPage, type ClubErrorPageProps };
