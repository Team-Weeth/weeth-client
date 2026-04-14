'use client';

import { useRef } from 'react';

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

  if (!hydrated.current) {
    useUserStore.setState(userInfo, false, 'setUser');
    useClubStore.setState(clubInfo, false, 'setClub');
    hydrated.current = true;
  }

  return children;
}

export { UserHydrator, type UserHydratorProps };
