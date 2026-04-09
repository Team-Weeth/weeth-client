'use client';

import { useEffect } from 'react';

import { useClubActions } from '@/stores/useClubStore';
import { useUserActions } from '@/stores/useUserStore';
import type { ClubIdentifier } from '@/types/club';
import type { UserInfo } from '@/types/user';

interface UserHydratorProps {
  userInfo: UserInfo;
  clubInfo: ClubIdentifier;
  children: React.ReactNode;
}

function UserHydrator({ userInfo, clubInfo, children }: UserHydratorProps) {
  const { setUser } = useUserActions();
  const { setClub } = useClubActions();

  useEffect(() => {
    setUser(userInfo);
    setClub(clubInfo);
  }, [userInfo, clubInfo, setUser, setClub]);

  return children;
}

export { UserHydrator, type UserHydratorProps };
