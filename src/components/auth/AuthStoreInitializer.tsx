'use client';

import { useEffect } from 'react';

import { useAuthStore } from '@/stores';

interface AuthStoreInitializerProps {
  name: string | null;
}

function AuthStoreInitializer({ name }: AuthStoreInitializerProps) {
  useEffect(() => {
    if (name) {
      const { profileImage, setProfile } = useAuthStore.getState();
      setProfile(name, profileImage);
    }
  }, [name]);

  return null;
}

export { AuthStoreInitializer };
