import { deleteToken, getToken } from 'firebase/messaging';
import { notificationApi } from '@/lib/apis/notification';
import { FIREBASE_VAPID_KEY, firebaseConfig } from '@/lib/firebase/config';
import { FIREBASE_SW_PATH, getMessagingInstance } from '@/lib/firebase/messaging';
import { getPushPlatform, isNativeApp } from '@/lib/push/platform';

export type FcmPermission = NotificationPermission | 'unsupported';

/** Firebase 기본 푸시 스코프. 루트(/)의 MSW 등 다른 서비스워커와 분리한다. */
const FIREBASE_SW_SCOPE = '/firebase-cloud-messaging-push-scope';

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

function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) return Promise.resolve(undefined);
  return navigator.serviceWorker.register(buildServiceWorkerUrl(), { scope: FIREBASE_SW_SCOPE });
}

function getExistingRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) return Promise.resolve(undefined);
  return navigator.serviceWorker.getRegistration(FIREBASE_SW_SCOPE);
}

/** 현재 환경에서 웹 푸시를 시도할 수 있는지 (네이티브/SSR/미지원 브라우저 제외) */
export function isWebPushSupportable(): boolean {
  return (
    !isNativeApp() && typeof window !== 'undefined' && typeof Notification !== 'undefined'
  );
}

/** 현재 브라우저 알림 권한 상태 */
export function getPermission(): FcmPermission {
  if (!isWebPushSupportable()) return 'unsupported';
  return Notification.permission;
}

/** 서비스워커 등록 → 토큰 발급 → 백엔드 등록. 권한은 이미 granted라고 가정한다. */
async function issueAndRegisterToken(): Promise<string | null> {
  const messaging = await getMessagingInstance();
  if (!messaging) return null;
  if (!FIREBASE_VAPID_KEY) {
    throw new Error('NEXT_PUBLIC_FIREBASE_VAPID_KEY가 설정되지 않았습니다.');
  }

  const registration = await registerServiceWorker();
  const token = await getToken(messaging, {
    vapidKey: FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
  if (!token) return null;

  await notificationApi.registerToken({ token, platform: getPushPlatform() });
  return token;
}

/** 권한 요청 → (허용 시) 토큰 발급·등록. 사용자 제스처 이후에 호출할 것. */
export async function requestPermissionAndRegister(): Promise<{
  permission: FcmPermission;
  token: string | null;
}> {
  if (!isWebPushSupportable()) return { permission: 'unsupported', token: null };
  const messaging = await getMessagingInstance();
  if (!messaging) return { permission: 'unsupported', token: null };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { permission, token: null };

  const token = await issueAndRegisterToken();
  return { permission, token };
}

/** 이미 권한이 granted인 경우에만 조용히 토큰을 재발급·등록 (로그인 직후 등) */
export async function registerTokenIfGranted(): Promise<string | null> {
  if (!isWebPushSupportable() || Notification.permission !== 'granted') return null;
  return issueAndRegisterToken();
}

/** 현재 토큰을 백엔드에서 해제하고 로컬에서 삭제 (best-effort, 로그아웃/토글 OFF) */
export async function revokeCurrentToken(): Promise<void> {
  if (!isWebPushSupportable() || Notification.permission !== 'granted') return;
  const messaging = await getMessagingInstance();
  if (!messaging) return;

  try {
    const registration = await getExistingRegistration();
    if (registration && FIREBASE_VAPID_KEY) {
      const token = await getToken(messaging, {
        vapidKey: FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });
      if (token) {
        await notificationApi.revokeToken({ token });
      }
    }
    await deleteToken(messaging);
  } catch {
    // 로그아웃 흐름을 막지 않도록 실패는 조용히 무시
  }
}
