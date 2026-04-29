'use client';

import { useSyncExternalStore } from 'react';

import { useClubId } from '@/stores/useClubStore';

const MAX_RETRY_DELAY = 30000;
const MAX_RETRY_COUNT = 10;

type Listener = () => void;
type QRStatus = 'qr-none' | 'qr-open' | 'qr-close' | null;

interface SSEConnection {
  subscriberCount: number;
  status: QRStatus;
  expiredAt: string | null;
  currentEvent: string;
  listeners: Set<Listener>;
  controller: AbortController | null;
  retryTimer: ReturnType<typeof setTimeout> | undefined;
  retryCount: number;
}

// clubId별 싱글턴 연결 — 여러 컴포넌트가 구독해도 연결은 1개만 유지
const connections = new Map<string, SSEConnection>();

function getOrCreateConnection(clubId: string): SSEConnection {
  const existing = connections.get(clubId);
  if (existing) return existing;

  const conn: SSEConnection = {
    subscriberCount: 0,
    status: null,
    expiredAt: null,
    currentEvent: '',
    listeners: new Set(),
    controller: null,
    retryTimer: undefined,
    retryCount: 0,
  };
  connections.set(clubId, conn);
  return conn;
}

function notify(conn: SSEConnection) {
  conn.listeners.forEach((listener) => listener());
}

function scheduleRetry(clubId: string, conn: SSEConnection) {
  if (conn.retryCount >= MAX_RETRY_COUNT) return;

  clearTimeout(conn.retryTimer);

  const delay = Math.min(1000 * 2 ** conn.retryCount, MAX_RETRY_DELAY);
  conn.retryCount++;
  conn.retryTimer = setTimeout(() => connect(clubId, conn), delay);
}

function processSSEText(text: string, buffer: string, conn: SSEConnection): string {
  const combined = buffer + text;
  const lines = combined.split(/\r?\n/);
  // 마지막 줄은 불완전할 수 있으므로 버퍼에 보관
  const remaining = lines.pop() ?? '';

  for (const line of lines) {
    // SSE event: 필드
    if (line.startsWith('event:')) {
      conn.currentEvent = line.slice(6).trim();
      continue;
    }

    // 빈 줄 = 이벤트 경계, currentEvent 초기화
    if (line === '') {
      conn.currentEvent = '';
      continue;
    }

    if (!line.startsWith('data:')) continue;

    const jsonStr = line.slice(5).trim();
    if (!jsonStr) continue;

    try {
      const parsed = JSON.parse(jsonStr) as {
        expiredAt?: string;
      } | null;

      const eventType = conn.currentEvent as QRStatus;

      if (eventType === 'qr-open' && parsed?.expiredAt) {
        conn.status = 'qr-open';
        conn.expiredAt = parsed.expiredAt;
        notify(conn);
      } else if (eventType === 'qr-none') {
        conn.status = 'qr-none';
        conn.expiredAt = null;
        notify(conn);
      } else if (eventType === 'qr-close') {
        conn.status = 'qr-close';
        conn.expiredAt = null;
        notify(conn);
      } else if (parsed?.expiredAt) {
        conn.expiredAt = parsed.expiredAt;
        notify(conn);
      }

      conn.retryCount = 0;
      conn.currentEvent = '';
    } catch {
      // ignore parse errors
    }
  }

  return remaining;
}

// SSE 연결 생성, 에러 시 지수 백오프로 재연결
async function connect(clubId: string, conn: SSEConnection) {
  const controller = new AbortController();
  conn.controller = controller;

  try {
    const response = await fetch(`/api/proxy/clubs/${clubId}/attendances/stream`, {
      headers: { Accept: 'text/event-stream' },
      signal: controller.signal,
    });

    if (response.status === 401) {
      // 토큰 리프레시 시도
      const refreshRes = await fetch('/api/proxy/auth/refresh', {
        method: 'POST',
      });

      if (refreshRes.ok) {
        // 리프레시 성공 → 즉시 재연결 (retryCount 유지)
        connect(clubId, conn);
        return;
      }

      // 리프레시 실패 → 로그인 페이지로 리다이렉트, 재시도 중단
      window.location.href = '/login';
      return;
    }

    if (response.status === 403) {
      // 권한 없음 → 재시도 중단
      return;
    }

    if (!response.ok || !response.body) {
      scheduleRetry(clubId, conn);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      buffer = processSSEText(text, buffer, conn);
    }

    // 스트림이 정상 종료된 경우 재연결
    scheduleRetry(clubId, conn);
  } catch (error) {
    // AbortError는 의도적 종료이므로 무시
    if (error instanceof DOMException && error.name === 'AbortError') return;

    scheduleRetry(clubId, conn);
  }
}

// 첫 구독자가 등록되면 연결, 마지막 구독자가 해제되면 연결 종료
function subscribe(clubId: string, conn: SSEConnection, listener: Listener) {
  conn.listeners.add(listener);
  conn.subscriberCount++;

  if (conn.subscriberCount === 1 && !conn.controller) {
    connect(clubId, conn);
  }

  return () => {
    conn.listeners.delete(listener);
    conn.subscriberCount--;

    if (conn.subscriberCount === 0) {
      conn.controller?.abort();
      conn.controller = null;
      clearTimeout(conn.retryTimer);
      conn.retryTimer = undefined;
      conn.retryCount = 0;
      conn.status = null;
      conn.expiredAt = null;
      conn.currentEvent = '';
      connections.delete(clubId);
    }
  };
}

function useAttendanceSSE() {
  const clubId = useClubId();

  const subscribeFn = (listener: Listener) => {
    if (!clubId) return () => {};
    const conn = getOrCreateConnection(clubId);
    return subscribe(clubId, conn, listener);
  };

  const expiredAt = useSyncExternalStore(
    subscribeFn,
    () => {
      if (!clubId) return null;
      return connections.get(clubId)?.expiredAt ?? null;
    },
    () => null,
  );

  const status = useSyncExternalStore(
    subscribeFn,
    () => {
      if (!clubId) return null;
      return connections.get(clubId)?.status ?? null;
    },
    () => null,
  );

  return { status, expiredAt };
}

export { useAttendanceSSE, type QRStatus };
