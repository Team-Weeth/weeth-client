'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { useClubActions, useClubId, useClubStore } from '@/stores/useClubStore';
import { useHomeQuery } from './useHomeQuery';

export function useHomeGuard() {
  const router = useRouter();
  const { clubId: clubIdParam } = useParams<{ clubId: string }>();
  const clubId = useClubId();
  const { reset, syncClubId } = useClubActions();
  const { error } = useHomeQuery();

  const hydrated = useSyncExternalStore(
    (cb) => useClubStore.persist.onFinishHydration(cb),
    () => useClubStore.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    if (!hydrated) return;

    if (clubIdParam && clubId !== clubIdParam) {
      syncClubId(clubIdParam);
      return;
    }

    if (!clubIdParam && !clubId) {
      reset();
      router.replace('/hub');
    }
  }, [hydrated, clubId, clubIdParam, reset, router, syncClubId]);

  useEffect(() => {
    if (isAxiosError(error) && error.response?.status === 404) {
      reset();
      router.replace('/hub');
    }
  }, [error, reset, router]);
}
