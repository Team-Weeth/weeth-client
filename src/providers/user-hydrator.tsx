'use client';

import { useEffect } from 'react';

import { useClubActions } from '@/stores/useClubStore';
import { useUserActions } from '@/stores/useUserStore';

interface UserInfo {
  id: number;
  name: string;
  profileImageUrl: string | null;
  role: 'LEAD' | 'ADMIN' | 'USER';
}

interface ClubInfo {
  clubId: string;
  clubName: string;
}

interface UserHydratorProps {
  userInfo: UserInfo;
  clubInfo: ClubInfo;
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
