import { API_BASE_PATH } from '@/constants/api';
import { parseSSEText, type QRStatus } from '@/utils/attendance/parseSSEText';

const MAX_RETRY_DELAY = 30000;
const MAX_RETRY_COUNT = 10;

type Listener = () => void;

interface SSEConnection {
  clubId: string;
  subscriberCount: number;
  status: QRStatus;
  expiredAt: string | null;
  currentEvent: string;
  listeners: Set<Listener>;
  controller: AbortController | null;
  retryTimer: ReturnType<typeof setTimeout> | undefined;
  retryCount: number;
  connected: boolean;
}

const connections = new Map<string, SSEConnection>();

const stateCache = new Map<string, { status: QRStatus; expiredAt: string | null }>();

const EMPTY_SNAPSHOT: { status: QRStatus; expiredAt: string | null } = {
  status: null,
  expiredAt: null,
};

function getOrCreateConnection(clubId: string): SSEConnection {
  const existing = connections.get(clubId);
  if (existing) return existing;

  const cached = stateCache.get(clubId);
  const conn: SSEConnection = {
    clubId,
    subscriberCount: 0,
    status: cached?.status ?? null,
    expiredAt: cached?.expiredAt ?? null,
    currentEvent: '',
    listeners: new Set(),
    controller: null,
    retryTimer: undefined,
    retryCount: 0,
    connected: false,
  };
  connections.set(clubId, conn);
  return conn;
}

function notify(conn: SSEConnection) {
  stateCache.set(conn.clubId, { status: conn.status, expiredAt: conn.expiredAt });
  conn.listeners.forEach((listener) => listener());
}

// reconnect: 연결 성공 후 끊김 (즉시 재연결, 카운트 리셋)
// retry: 연결 자체 실패 (지수 백오프, 최대 횟수 제한)
function scheduleRetry(clubId: string, conn: SSEConnection, mode: 'reconnect' | 'retry') {
  clearTimeout(conn.retryTimer);

  if (mode === 'reconnect') {
    conn.retryCount = 0;
    conn.retryTimer = setTimeout(() => connect(clubId, conn), 1000);
    return;
  }

  if (conn.retryCount >= MAX_RETRY_COUNT) return;

  const delay = Math.min(1000 * 2 ** conn.retryCount, MAX_RETRY_DELAY);
  conn.retryCount++;
  conn.retryTimer = setTimeout(() => connect(clubId, conn), delay);
}

type FetchTokensResult =
  | { ok: true; accessToken: string }
  | { ok: false; reason: 'unauthenticated' }
  | { ok: false; reason: 'transient' };

async function fetchTokens(): Promise<FetchTokensResult> {
  try {
    const res = await fetch('/api/auth/token');
    if (res.status === 401) return { ok: false, reason: 'unauthenticated' };
    if (!res.ok) return { ok: false, reason: 'transient' };
    const data = (await res.json()) as { accessToken?: string };
    if (!data.accessToken) return { ok: false, reason: 'transient' };
    return { ok: true, accessToken: data.accessToken };
  } catch {
    return { ok: false, reason: 'transient' };
  }
}

// 브라우저가 API 서버와 직접 커넥션을 유지하여 스트림을 즉시 수신
async function connect(clubId: string, conn: SSEConnection) {
  conn.controller = new AbortController();

  try {
    const tokens = await fetchTokens();

    if (conn.subscriberCount === 0) return;

    if (!tokens.ok) {
      if (tokens.reason === 'unauthenticated') {
        window.location.href = '/login';
        return;
      }
      // 일시 장애(5xx, 네트워크 오류 등) → retry 경로로 처리
      scheduleRetry(clubId, conn, 'retry');
      return;
    }

    const controller = new AbortController();
    conn.controller = controller;

    const response = await fetch(`${API_BASE_PATH}/clubs/${clubId}/attendances/stream`, {
      headers: {
        Accept: 'text/event-stream',
        Authorization: `Bearer ${tokens.accessToken}`,
      },
      signal: controller.signal,
    });

    if (response.status === 401) {
      // 토큰 리프레시 시도
      const refreshRes = await fetch('/api/proxy/auth/refresh', { method: 'POST' });

      if (refreshRes.ok) {
        connect(clubId, conn);
        return;
      }

      window.location.href = '/login';
      return;
    }

    if (response.status === 403) {
      // 권한 없음 → 재시도 중단
      return;
    }

    if (!response.ok || !response.body) {
      console.error('[SSE] 연결 실패:', response.status, response.statusText);
      scheduleRetry(clubId, conn, 'retry');
      return;
    }

    conn.connected = true;
    conn.retryCount = 0;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const { remaining, currentEvent, updates, resetRetry } = parseSSEText(
        decoder.decode(value, { stream: true }),
        buffer,
        conn.currentEvent,
      );
      buffer = remaining;
      conn.currentEvent = currentEvent;
      if (resetRetry) conn.retryCount = 0;

      for (const update of updates) {
        if (update.kind === 'status') {
          conn.status = update.status;
          conn.expiredAt = update.expiredAt;
        } else {
          conn.expiredAt = update.expiredAt;
        }
        notify(conn);
      }
    }

    // 스트림이 정상 종료된 경우 즉시 재연결
    conn.connected = false;
    scheduleRetry(clubId, conn, 'reconnect');
  } catch (error) {
    const wasConnected = conn.connected;
    conn.connected = false;

    if (error instanceof DOMException && error.name === 'AbortError') return;

    if (wasConnected) {
      scheduleRetry(clubId, conn, 'reconnect');
      return;
    }

    console.error('[SSE] 연결 에러:', error);
    scheduleRetry(clubId, conn, 'retry');
  }
}

// 첫 구독자가 등록되면 연결, 마지막 구독자가 해제되면 연결 종료
function subscribe(clubId: string, listener: Listener) {
  const conn = getOrCreateConnection(clubId);
  conn.listeners.add(listener);
  conn.subscriberCount++;

  if (conn.subscriberCount === 1 && !conn.controller) {
    connect(clubId, conn);
  }

  return () => {
    conn.listeners.delete(listener);
    conn.subscriberCount--;

    setTimeout(() => {
      if (conn.subscriberCount === 0) {
        conn.controller?.abort();
        conn.controller = null;
        clearTimeout(conn.retryTimer);
        conn.retryTimer = undefined;
        conn.retryCount = 0;
        conn.connected = false;
        conn.status = null;
        conn.expiredAt = null;
        conn.currentEvent = '';
        connections.delete(clubId);
      }
    }, 0);
  };
}

function getSnapshot(clubId: string): { status: QRStatus; expiredAt: string | null } {
  const conn = connections.get(clubId);
  if (conn) return { status: conn.status, expiredAt: conn.expiredAt };
  return stateCache.get(clubId) ?? EMPTY_SNAPSHOT;
}

export { subscribe, getSnapshot, EMPTY_SNAPSHOT, type QRStatus, type Listener };
