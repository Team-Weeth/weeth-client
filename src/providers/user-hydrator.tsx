'use client';

import { useEffect, useRef } from 'react';

import { setClubCookie } from '@/lib/actions/club';
import { useClubStore } from '@/stores/useClubStore';
import { useUserStore } from '@/stores/useUserStore';
import type { ClubIdentifier } from '@/types/club';
import type { UserInfo } from '@/types/user';

interface UserHydratorProps {
  userInfo: UserInfo;
  clubInfo: ClubIdentifier;
  syncCookies?: boolean;
  children: React.ReactNode;
}

function UserHydrator({ userInfo, clubInfo, syncCookies, children }: UserHydratorProps) {
  const hydrated = useRef(false);

  if (!hydrated.current) {
    useUserStore.setState(userInfo, false, 'setUser');
    useClubStore.setState(clubInfo, false, 'setClub');
    hydrated.current = true;
  }

  useEffect(() => {
    if (syncCookies) {
      setClubCookie(clubInfo.clubId, clubInfo.clubName);
    }
  }, [syncCookies, clubInfo.clubId, clubInfo.clubName]);

  return children;
}

export { UserHydrator, type UserHydratorProps };
