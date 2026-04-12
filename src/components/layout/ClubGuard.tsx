'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { setClubCookie } from '@/lib/actions/club';
import { apiClient } from '@/lib/apis/client';
import { useClubActions, useClubId } from '@/stores';

interface ClubGuardProps {
  children: React.ReactNode;
}

interface Club {
  id: string;
  name: string;
}

interface MyClubsResponse {
  data: Club[];
}

function ClubGuard({ children }: ClubGuardProps) {
  const clubId = useClubId();
  const { setClub } = useClubActions();
  const router = useRouter();
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (clubId || fetchingRef.current) return;
    fetchingRef.current = true;

    apiClient
      .get<MyClubsResponse>('/clubs')
      .then(async (res) => {
        const club = res.data?.data?.[0];
        if (club) {
          await setClubCookie(club.id, club.name);
          setClub(club.id, club.name);
          router.refresh();
        }
      })
      .catch(() => {
        // 실패 시 무시 — 개별 쿼리들이 enabled: !!clubId로 게이팅됨
      })
      .finally(() => {
        fetchingRef.current = false;
      });
  }, [clubId, setClub, router]);

  return <>{children}</>;
}

export { ClubGuard };
