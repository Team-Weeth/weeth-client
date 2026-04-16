'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { useClubActions, useClubId, useClubName, useClubStore } from '@/stores/useClubStore';
import { useHomeQuery } from './useHomeQuery';

export function useHomeGuard() {
  const router = useRouter();
  const clubId = useClubId();
  const clubName = useClubName();
  const { reset } = useClubActions();
  const { error } = useHomeQuery();

  const hydrated = useSyncExternalStore(
    (cb) => useClubStore.persist.onFinishHydration(cb),
    () => useClubStore.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    if (!hydrated) return;
    if (!clubId || !clubName) {
      reset();
      router.replace('/hub');
    }
  }, [hydrated, clubId, clubName, reset, router]);

  useEffect(() => {
    if (isAxiosError(error) && error.response?.status === 404) {
      reset();
      router.replace('/hub');
    }
  }, [error, reset, router]);
}
