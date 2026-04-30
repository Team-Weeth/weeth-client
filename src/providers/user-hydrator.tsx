'use client';

import { useLayoutEffect } from 'react';

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
  useLayoutEffect(() => {
    const currentUser = useUserStore.getState();
    const currentClub = useClubStore.getState();

    if (
      currentUser.id !== userInfo.id ||
      currentUser.profileImageUrl !== userInfo.profileImageUrl
    ) {
      useUserStore.setState(userInfo, false, 'setUser');
    }

    if (currentClub.clubId !== clubInfo.clubId || currentClub.clubName !== clubInfo.clubName) {
      useClubStore.setState(clubInfo, false, 'setClub');
    }
  }, [clubInfo, userInfo]);

  return children;
}

export { UserHydrator, type UserHydratorProps };
