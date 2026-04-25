'use client';

import { useSyncExternalStore } from 'react';

import { useClubId } from '@/stores/useClubStore';

const MAX_RETRY_DELAY = 30000;

type Listener = () => void;

interface SSEConnection {
  subscriberCount: number;
  expiredAt: string | null;
  listeners: Set<Listener>;
  es: EventSource | null;
  retryTimer: ReturnType<typeof setTimeout> | undefined;
  retryCount: number;
}

// clubId별 싱글턴 연결 — 여러 컴포넌트가 구독해도 EventSource는 1개만 유지
const connections = new Map<string, SSEConnection>();

function getOrCreateConnection(clubId: string): SSEConnection {
  const existing = connections.get(clubId);
  if (existing) return existing;

  const conn: SSEConnection = {
    subscriberCount: 0,
    expiredAt: null,
    listeners: new Set(),
    es: null,
    retryTimer: undefined,
    retryCount: 0,
  };
  connections.set(clubId, conn);
  return conn;
}

function notify(conn: SSEConnection) {
  conn.listeners.forEach((listener) => listener());
}

// SSE 연결 생성, 에러 시 지수 백오프로 재연결
function connect(clubId: string, conn: SSEConnection) {
  conn.es = new EventSource(`/api/proxy/clubs/${clubId}/attendances/stream`);

  conn.es.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data) as {
        data?: { expiredAt?: string };
      };

      if (parsed.data?.expiredAt) {
        conn.expiredAt = parsed.data.expiredAt;
        notify(conn);
      }
      conn.retryCount = 0;
    } catch {
      // ignore parse errors
    }
  };

  conn.es.onerror = () => {
    conn.es?.close();
    conn.es = null;
    const delay = Math.min(1000 * 2 ** conn.retryCount, MAX_RETRY_DELAY);
    conn.retryCount++;
    conn.retryTimer = setTimeout(() => connect(clubId, conn), delay);
  };
}

// 첫 구독자가 등록되면 연결, 마지막 구독자가 해제되면 연결 종료
function subscribe(clubId: string, conn: SSEConnection, listener: Listener) {
  conn.listeners.add(listener);
  conn.subscriberCount++;

  if (conn.subscriberCount === 1) {
    connect(clubId, conn);
  }

  return () => {
    conn.listeners.delete(listener);
    conn.subscriberCount--;

    if (conn.subscriberCount === 0) {
      conn.es?.close();
      conn.es = null;
      clearTimeout(conn.retryTimer);
      conn.retryTimer = undefined;
      conn.retryCount = 0;
      conn.expiredAt = null;
      connections.delete(clubId);
    }
  };
}

function useAttendanceSSE() {
  const clubId = useClubId();

  const expiredAt = useSyncExternalStore(
    (listener) => {
      if (!clubId) return () => {};
      const conn = getOrCreateConnection(clubId);
      return subscribe(clubId, conn, listener);
    },
    () => {
      if (!clubId) return null;
      return connections.get(clubId)?.expiredAt ?? null;
    },
    // SSR에서는 항상 null
    () => null,
  );

  return { expiredAt };
}

export { useAttendanceSSE };
