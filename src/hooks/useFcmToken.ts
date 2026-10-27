'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { onMessage, type MessagePayload } from 'firebase/messaging';
import { getMessagingInstance } from '@/lib/firebase/messaging';
import { isNativeApp } from '@/lib/push/platform';
import {
  getPermission,
  requestPermissionAndRegister as requestPermissionAndRegisterToken,
  revokeCurrentToken,
  type FcmPermission,
} from '@/lib/push/webPush';

interface UseFcmTokenOptions {
  /** 포그라운드(앱 활성 상태)에서 메시지 수신 시 호출 */
  onForegroundMessage?: (payload: MessagePayload) => void;
}

interface UseFcmTokenResult {
  token: string | null;
  permission: FcmPermission;
  isPending: boolean;
  error: Error | null;
  /** 사용자 제스처 이후 호출. 권한 요청 → 토큰 발급 → 백엔드 등록. 발급된 토큰 반환(실패 시 null) */
  enable: () => Promise<string | null>;
  /** 토큰 해제 + 백엔드 revoke */
  disable: () => Promise<void>;
}

export type { FcmPermission };

/**
 * 웹(FCM Web Push) 푸시 토큰 발급/해제 + 포그라운드 수신 훅.
 * 네이티브(Capacitor) 환경에서는 동작하지 않는다(WebView Web Push 미지원).
 */
export function useFcmToken(options: UseFcmTokenOptions = {}): UseFcmTokenResult {
  const { onForegroundMessage } = options;

  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<FcmPermission>('unsupported');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const onForegroundMessageRef = useRef(onForegroundMessage);
  onForegroundMessageRef.current = onForegroundMessage;

  useEffect(() => {
    setPermission(getPermission());
  }, []);

  // 포그라운드 메시지 구독
  useEffect(() => {
    if (isNativeApp()) return;

    let unsubscribe: (() => void) | undefined;
    getMessagingInstance().then((messaging) => {
      if (!messaging) return;
      unsubscribe = onMessage(messaging, (payload) => {
        onForegroundMessageRef.current?.(payload);
      });
    });

    return () => unsubscribe?.();
  }, []);

  const enable = useCallback(async (): Promise<string | null> => {
    setError(null);
    setIsPending(true);
    try {
      const result = await requestPermissionAndRegisterToken();
      setPermission(result.permission);
      setToken(result.token);
      return result.token;
    } catch (err) {
      const normalized = err instanceof Error ? err : new Error('FCM 토큰 등록 실패');
      setError(normalized);
      throw normalized;
    } finally {
      setIsPending(false);
    }
  }, []);

  const disable = useCallback(async (): Promise<void> => {
    setError(null);
    setIsPending(true);
    try {
      await revokeCurrentToken();
      setToken(null);
    } catch (err) {
      const normalized = err instanceof Error ? err : new Error('FCM 토큰 해제 실패');
      setError(normalized);
      throw normalized;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { token, permission, isPending, error, enable, disable };
}
