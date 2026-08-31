'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button, buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

interface ClubErrorPageProps {
  title?: string;
  message?: string;
  showRefreshButton?: boolean;
}

function ClubErrorPage({
  title = '존재하지 않는 동아리입니다.',
  message,
  showRefreshButton = title !== '존재하지 않는 동아리입니다.',
}: ClubErrorPageProps) {
  const router = useRouter();

  return (
    <div className="bg-container-neutral-alternative flex min-h-screen flex-col items-center justify-center gap-500 px-400">
      <div className="flex max-w-120 flex-col items-center gap-200 text-center">
        <h1 className="typo-h3 text-text-strong">{title}</h1>
        {message && <p className="typo-body2 text-text-alternative">{message}</p>}
      </div>
      <div className="flex w-full max-w-80 flex-col gap-200">
        {showRefreshButton && (
          <Button variant="secondary" size="lg" onClick={() => router.refresh()}>
            새로고침
          </Button>
        )}
        <Link href="/" className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}>
          처음으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export { ClubErrorPage, type ClubErrorPageProps };
