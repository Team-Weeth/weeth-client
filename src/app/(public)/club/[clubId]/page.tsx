import Link from 'next/link';

import { ClubAccessPage, ClubConfirmCard } from '@/components/auth/invite';
import { buttonVariants } from '@/components/ui';
import { apiServer } from '@/lib/apis';
import { cn } from '@/lib/cn';
import type { Club } from '@/types';

interface ClubPageProps {
  params: Promise<{ clubId: string }>;
  searchParams: Promise<{ code?: string }>;
}

export default async function ClubPage({ params, searchParams }: ClubPageProps) {
  const { clubId } = await params;
  const { code } = await searchParams;

  let club: Club;
  try {
    const { data } = await apiServer.get<{ data: Club }>(`/clubs/${clubId}`);
    club = data;
  } catch {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-500 px-400">
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

  if (code) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <ClubConfirmCard
          club={club}
          confirmHref={`/login?intent=join&clubId=${clubId}&code=${code}`}
        />
      </div>
    );
  }

  return <ClubAccessPage club={club} />;
}
