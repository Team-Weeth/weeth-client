'use client';

import { useEffect, useRef } from 'react';

import { useClubStore } from '@/stores/useClubStore';
import { useUserStore } from '@/stores/useUserStore';
import type { ClubIdentifier } from '@/types/club';
import type { UserInfo } from '@/types/user';

interface UserHydratorProps {
  userInfo: UserInfo;
  clubInfo: ClubIdentifier;
  children: React.ReactNode;
}

function UserHydrator({ userInfo, clubInfo, children }: UserHydratorProps) {
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    useUserStore.setState(userInfo, false, 'setUser');
    useClubStore.setState(clubInfo, false, 'setClub');
    hydrated.current = true;
  }, [clubInfo, userInfo]);

  return children;
}

export { UserHydrator, type UserHydratorProps };
