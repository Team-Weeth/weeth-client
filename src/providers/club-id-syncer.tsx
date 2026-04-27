'use client';

import { useClubStore } from '@/stores/useClubStore';

interface ClubIdSyncerProps {
  clubId: string;
  children: React.ReactNode;
}

function ClubIdSyncer({ clubId, children }: ClubIdSyncerProps) {
  const currentClubId = useClubStore((s) => s.clubId);

  if (currentClubId !== clubId) {
    useClubStore.setState({ clubId }, false, 'setClubId');
  }

  return children;
}

export { ClubIdSyncer, type ClubIdSyncerProps };
