'use client';

import { useCallback, useSyncExternalStore, useRef } from 'react';

import { useClubId } from '@/stores/useClubStore';

import {
  subscribe,
  getSnapshot,
  EMPTY_SNAPSHOT,
  type QRStatus,
  type Listener,
} from './attendanceSSEConnection';

interface UseAttendanceSSEOptions {
  enabled?: boolean;
}

function useAttendanceSSE({ enabled = true }: UseAttendanceSSEOptions = {}) {
  const clubId = useClubId();

  const subscribeFn = useCallback(
    (listener: Listener) => {
      if (!clubId || !enabled) return () => {};
      return subscribe(clubId, listener);
    },
    [clubId, enabled],
  );

  const prevSnapshotRef = useRef<{ status: QRStatus; expiredAt: string | null } | null>(null);

  const snapshot = useSyncExternalStore(
    subscribeFn,
    () => {
      if (!clubId) return EMPTY_SNAPSHOT;

      const next = getSnapshot(clubId);

      const prev = prevSnapshotRef.current;
      if (prev && prev.status === next.status && prev.expiredAt === next.expiredAt) {
        return prev;
      }

      prevSnapshotRef.current = next;
      return next;
    },
    () => EMPTY_SNAPSHOT,
  );

  return snapshot;
}

export { useAttendanceSSE, type QRStatus, type UseAttendanceSSEOptions };
