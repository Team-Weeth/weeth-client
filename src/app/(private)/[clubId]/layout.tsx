import type { ReactNode } from 'react';
import { cookies } from 'next/headers';

import { ClubAccessPage, ClubNotFoundPage } from '@/components/auth/invite';
import { apiServer } from '@/lib/apis/server';
import { ACCESS_TOKEN_KEY } from '@/lib/apis/cookies';
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
  } catch {
    return <ClubNotFoundPage />;
  }

  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has(ACCESS_TOKEN_KEY);

  if (!isLoggedIn) {
    return <ClubAccessPage club={club} loginHref={`/login?redirect=/${clubId}/home`} />;
  }

  try {
    await apiServer.get(`/clubs/${clubId}/members/me`);
  } catch {
    return <ClubAccessPage club={club} />;
  }

  return <>{children}</>;
}
