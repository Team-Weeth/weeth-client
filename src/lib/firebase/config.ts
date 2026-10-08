import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';

/**
 * Firebase 웹 config. 모두 공개 가능한 client 식별자이므로 NEXT_PUBLIC_ 노출이 정상이다.
 * 값은 Firebase 콘솔 > 프로젝트 설정 > 내 앱(웹)에서 확인한다.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const;

/** 웹 푸시 토큰 발급에 필요한 VAPID 공개키 */
export const FIREBASE_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/** config가 모두 채워졌는지 (미설정 환경에서 초기화 시도를 막기 위함) */
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.projectId && firebaseConfig.appId && firebaseConfig.apiKey);
}

/** 앱 인스턴스를 싱글톤으로 반환 (HMR/중복 initializeApp 방지) */
export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}
