import type { ReactNode } from 'react';
import { cookies, headers } from 'next/headers';

import { ClubAccessPage } from '@/components/auth/invite/ClubAccessPage';
import { ClubErrorPage } from '@/components/auth/invite/ClubErrorPage';
import { ApiError, apiServer } from '@/lib/apis/server';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/apis/cookies';
import type { Club } from '@/types';

interface ClubLayoutProps {
  children: ReactNode;
  params: Promise<{ clubId: string }>;
}

export default async function ClubLayout({ children, params }: ClubLayoutProps) {
  const { clubId } = await params;

  let club: Club;
  try {
    const res = await apiServer.get<{ data: Club }>(`/clubs/${clubId}`);
    club = res.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return <ClubErrorPage />;
    }
    throw error;
  }

  const cookieStore = await cookies();
  const hasAccessToken = cookieStore.has(ACCESS_TOKEN_KEY);
  const hasRefreshToken = cookieStore.has(REFRESH_TOKEN_KEY);
  const hasAuthSession = hasAccessToken || hasRefreshToken;

  if (!hasAuthSession) {
    const headerStore = await headers();
    const pathname = headerStore.get('x-pathname') ?? `/${clubId}/home`;
    return <ClubAccessPage club={club} loginHref={`/login?redirect=${pathname}`} />;
  }

  try {
    await apiServer.get(`/clubs/${clubId}/members/me`);
  } catch (error) {
    if (error instanceof ApiError && [403, 404].includes(error.status)) {
      return <ClubAccessPage club={club} />;
    }

    throw error;
  }

  return <>{children}</>;
}
