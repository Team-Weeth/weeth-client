import { cookies } from 'next/headers';

import { ClubAccessPage, ClubConfirmCard, ClubNotFoundPage } from '@/components/auth/invite';
import { apiServer } from '@/lib/apis';
import { ACCESS_TOKEN_KEY } from '@/lib/apis/cookies';
import type { Club } from '@/types';

interface ClubPageProps {
  params: Promise<{ clubId: string }>;
  searchParams: Promise<{ code?: string }>;
}

export default async function ClubPage({ params, searchParams }: ClubPageProps) {
  const { clubId } = await params;
  const { code } = await searchParams;
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has(ACCESS_TOKEN_KEY);

  let club: Club;
  try {
    const { data } = await apiServer.get<{ data: Club }>(`/clubs/${clubId}`);
    club = data;
  } catch {
    return <ClubNotFoundPage />;
  }

  if (code) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <ClubConfirmCard
          club={club}
          confirmHref={
            isLoggedIn
              ? `/joining?clubId=${clubId}&code=${code}`
              : `/login?intent=join&clubId=${clubId}&code=${code}`
          }
        />
      </div>
    );
  }

  return (
    <ClubAccessPage
      club={club}
      loginHref={
        isLoggedIn
          ? '/club/join'
          : `/login?intent=join-no-code&clubId=${club.id}`
      }
    />
  );
}
