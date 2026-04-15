'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { useClubActions, useClubId, useClubName } from '@/stores/useClubStore';
import { useHomeQuery } from './useHomeQuery';

export function useHomeGuard() {
  const router = useRouter();
  const clubId = useClubId();
  const clubName = useClubName();
  const { reset } = useClubActions();
  const { error } = useHomeQuery();

  useEffect(() => {
    if (!clubId || !clubName) {
      reset();
      router.replace('/hub');
    }
  }, [clubId, clubName, reset, router]);

  useEffect(() => {
    if (isAxiosError(error) && error.response?.status === 404) {
      reset();
      router.replace('/hub');
    }
  }, [error, reset, router]);
}
