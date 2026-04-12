'use client';

import { useEffect, useRef } from 'react';

import { setClubCookie } from '@/lib/actions/club';
import { apiClient } from '@/lib/apis/client';
import { useClubActions, useClubId } from '@/stores';

interface ClubGuardProps {
  children: React.ReactNode;
}

interface MembershipStatusResponse {
  data: {
    hasActiveClub: boolean;
    activeClub: { id: string; name: string } | null;
  };
}

function ClubGuard({ children }: ClubGuardProps) {
  const clubId = useClubId();
  const { setClub } = useClubActions();
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (clubId || fetchingRef.current) return;
    fetchingRef.current = true;

    apiClient
      .get<MembershipStatusResponse>('/clubs/membership-status')
      .then(async (res) => {
        const activeClub = res.data?.data?.activeClub;
        if (activeClub) {
          await setClubCookie(activeClub.id, activeClub.name);
          setClub(activeClub.id, activeClub.name);
        }
      })
      .catch(() => {
        // 실패 시 무시 — 개별 쿼리들이 enabled: !!clubId로 게이팅됨
      })
      .finally(() => {
        fetchingRef.current = false;
      });
  }, [clubId, setClub]);

  return <>{children}</>;
}

export { ClubGuard };
