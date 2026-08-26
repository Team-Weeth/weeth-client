import { cookies } from 'next/headers';
import { API_BASE_PATH } from '@/constants/api';
import { ClubAccessPage } from '@/components/auth/invite/ClubAccessPage';
import { ClubConfirmCard } from '@/components/auth/invite/ClubConfirmCard';
import { ClubErrorPage } from '@/components/auth/invite/ClubErrorPage';
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

  let club: Club | null = null;
  let errorTitle: string | null = null;
  let errorMessage: string | null = null;

  try {
    const response = await fetch(`${API_BASE_PATH}/clubs/${clubId}`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300, tags: [`public-club-${clubId}`] },
    });

    if (!response.ok) {
      let message = '동아리 정보를 불러오는 중 문제가 발생했어요.';

      try {
        const errorJson = (await response.json()) as { message?: string };
        if (typeof errorJson.message === 'string' && errorJson.message.trim()) {
          message = errorJson.message;
        }
      } catch {
        // fall back to the default message when the error body is not JSON
      }

      if (response.status === 404) {
        errorTitle = '존재하지 않는 동아리입니다.';
        errorMessage = null;
      } else {
        errorTitle = '동아리 정보를 불러오지 못했어요.';
        errorMessage = message;
      }
    } else {
      const json = (await response.json()) as { data: Club };
      club = json.data;
    }
  } catch (error) {
    console.error('Failed to load public club page:', error);
    errorTitle = '동아리 정보를 불러오지 못했어요.';
    errorMessage = '동아리 정보를 불러오는 중 문제가 발생했어요.';
  }

  if (!club) {
    return <ClubErrorPage title={errorTitle ?? undefined} message={errorMessage ?? undefined} />;
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
      loginHref={isLoggedIn ? '/club/join' : `/login?intent=join-no-code&clubId=${club.id}`}
    />
  );
}
