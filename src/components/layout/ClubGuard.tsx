'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { setClubCookie } from '@/lib/actions/club';
import { apiClient } from '@/lib/apis/client';
import { useClubActions, useClubId } from '@/stores';

interface ClubGuardProps {
  /** 서버에서 쿠키 누락을 감지한 경우 true */
  cookieMissing?: boolean;
  children: React.ReactNode;
}

interface Club {
  id: string;
  name: string;
}

interface MyClubsResponse {
  data: Club[];
}

function ClubGuard({ cookieMissing, children }: ClubGuardProps) {
  const clubId = useClubId();
  const { setClub } = useClubActions();
  const router = useRouter();
  const fetchingRef = useRef(false);

  const needsFetch = cookieMissing || !clubId;

  useEffect(() => {
    if (!needsFetch || fetchingRef.current) return;
    fetchingRef.current = true;

    apiClient
      .get<MyClubsResponse>('/clubs')
      .then(async (res) => {
        const club = res.data?.data?.[0];
        if (club?.id && club?.name) {
          await setClubCookie(club.id, club.name);
          setClub(club.id, club.name);
          router.refresh();
        }
      })
      .catch(() => {
        // 실패 시 무시 — 개별 쿼리들이 enabled: !!clubId로 게이팅됨
      });
  }, [needsFetch, setClub, router]);

  return <>{children}</>;
}

export { ClubGuard };
