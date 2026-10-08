'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteToken, getToken, onMessage, type MessagePayload } from 'firebase/messaging';
import { notificationApi } from '@/lib/apis/notification';
import { FIREBASE_VAPID_KEY, firebaseConfig } from '@/lib/firebase/config';
import { FIREBASE_SW_PATH, getMessagingInstance } from '@/lib/firebase/messaging';
import { getPushPlatform, isNativeApp } from '@/lib/push/platform';

/** Firebase 기본 푸시 스코프. 루트(/)의 MSW 등 다른 서비스워커와 분리한다. */
const FIREBASE_SW_SCOPE = '/firebase-cloud-messaging-push-scope';

export type FcmPermission = NotificationPermission | 'unsupported';

interface UseFcmTokenOptions {
  /** 포그라운드(앱 활성 상태)에서 메시지 수신 시 호출 */
  onForegroundMessage?: (payload: MessagePayload) => void;
}

interface UseFcmTokenResult {
  token: string | null;
  permission: FcmPermission;
  isRegistering: boolean;
  error: Error | null;
  /** 사용자 제스처(버튼 클릭 등) 이후에 호출할 것. 권한 요청 → 토큰 발급 → 백엔드 등록 */
  requestPermissionAndRegister: () => Promise<string | null>;
  /** 로그아웃 등에서 토큰 삭제 + 백엔드 해제 */
  revoke: () => Promise<void>;
}

/** config를 쿼리스트링으로 실어 서비스워커 URL을 만든다 (public 정적 파일이 env를 못 읽기 때문) */
function buildServiceWorkerUrl(): string {
  const params = new URLSearchParams({
    apiKey: firebaseConfig.apiKey ?? '',
    authDomain: firebaseConfig.authDomain ?? '',
    projectId: firebaseConfig.projectId ?? '',
    messagingSenderId: firebaseConfig.messagingSenderId ?? '',
    appId: firebaseConfig.appId ?? '',
  });
  return `${FIREBASE_SW_PATH}?${params.toString()}`;
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) return undefined;
  return navigator.serviceWorker.register(buildServiceWorkerUrl(), {
    scope: FIREBASE_SW_SCOPE,
  });
}

function getInitialPermission(): FcmPermission {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * 웹(FCM Web Push) 푸시 토큰 발급/등록 훅.
 *
 * - 네이티브(Capacitor) 환경에서는 동작하지 않는다(WebView는 Web Push 미지원).
 *   네이티브 푸시는 추후 @capacitor/push-notifications 경로에서 별도 처리한다.
 * - 권한 요청은 반드시 사용자 제스처 이후 requestPermissionAndRegister()로 호출한다.
 */
export function useFcmToken(options: UseFcmTokenOptions = {}): UseFcmTokenResult {
  const { onForegroundMessage } = options;

  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<FcmPermission>('unsupported');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 리스너가 최신 콜백을 참조하도록 ref로 보관 (의존성으로 인한 재구독 방지)
  const onForegroundMessageRef = useRef(onForegroundMessage);
  onForegroundMessageRef.current = onForegroundMessage;

  useEffect(() => {
    setPermission(getInitialPermission());
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

  const requestPermissionAndRegister = useCallback(async (): Promise<string | null> => {
    setError(null);

    if (isNativeApp()) {
      // 네이티브 경로는 아직 미구현 (Capacitor 플러그인 연동 예정)
      return null;
    }

    const messaging = await getMessagingInstance();
    if (!messaging || typeof Notification === 'undefined') {
      setPermission('unsupported');
      return null;
    }

    if (!FIREBASE_VAPID_KEY) {
      const configError = new Error('NEXT_PUBLIC_FIREBASE_VAPID_KEY가 설정되지 않았습니다.');
      setError(configError);
      throw configError;
    }

    setIsRegistering(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') return null;

      const registration = await registerServiceWorker();
      const fcmToken = await getToken(messaging, {
        vapidKey: FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (!fcmToken) return null;

      await notificationApi.registerToken({ token: fcmToken, platform: getPushPlatform() });
      setToken(fcmToken);
      return fcmToken;
    } catch (err) {
      const normalized = err instanceof Error ? err : new Error('FCM 토큰 등록 실패');
      setError(normalized);
      throw normalized;
    } finally {
      setIsRegistering(false);
    }
  }, []);

  const revoke = useCallback(async (): Promise<void> => {
    if (isNativeApp()) return;

    const messaging = await getMessagingInstance();
    if (!messaging) return;

    try {
      const current = token ?? (await getToken(messaging, { vapidKey: FIREBASE_VAPID_KEY }));
      if (current) {
        await notificationApi.revokeToken({ token: current });
      }
      await deleteToken(messaging);
    } finally {
      setToken(null);
    }
  }, [token]);

  return { token, permission, isRegistering, error, requestPermissionAndRegister, revoke };
}
