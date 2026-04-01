'use client';

import { useEffect } from 'react';

import { useAuthStore } from '@/stores';

interface AuthStoreInitializerProps {
  name: string | null;
}

function AuthStoreInitializer({ name }: AuthStoreInitializerProps) {
  useEffect(() => {
    if (name) {
      useAuthStore.getState().setProfile(name, null);
    }
  }, [name]);

  return null;
}

export { AuthStoreInitializer };
