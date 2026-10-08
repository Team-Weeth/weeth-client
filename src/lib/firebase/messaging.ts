import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';
import { getFirebaseApp, isFirebaseConfigured } from '@/lib/firebase/config';

/**
 * 서비스워커 파일 경로. config를 쿼리스트링으로 주입해
 * public 정적 파일이 process.env 없이도 초기화되도록 한다.
 */
export const FIREBASE_SW_PATH = '/firebase-messaging-sw.js';

let messagingPromise: Promise<Messaging | null> | null = null;

/**
 * 브라우저에서만, 그리고 Web Push가 지원될 때만 Messaging 인스턴스를 반환한다.
 * - SSR(window 없음), 미지원 브라우저, config 미설정 시 null.
 * - isSupported()는 Notification/ServiceWorker/PushManager 지원 여부를 함께 확인한다.
 */
export function getMessagingInstance(): Promise<Messaging | null> {
  if (typeof window === 'undefined' || !isFirebaseConfigured()) {
    return Promise.resolve(null);
  }

  if (!messagingPromise) {
    messagingPromise = isSupported()
      .then((supported) => (supported ? getMessaging(getFirebaseApp()) : null))
      .catch(() => null);
  }

  return messagingPromise;
}
