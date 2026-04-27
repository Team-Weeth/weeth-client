'use client';

import { useRef } from 'react';

import { useClubStore } from '@/stores/useClubStore';

interface ClubIdSyncerProps {
  clubId: string;
  children: React.ReactNode;
}

function ClubIdSyncer({ clubId, children }: ClubIdSyncerProps) {
  const hydrated = useRef(false);

  if (!hydrated.current) {
    useClubStore.setState({ clubId }, false, 'setClubId');
    hydrated.current = true;
  }

  return children;
}

export { ClubIdSyncer, type ClubIdSyncerProps };
