/**
 * 알림 사용 여부에 대한 사용자 의도를 로컬에 저장한다.
 *
 * 브라우저 알림 권한(Notification.permission)은 코드로 해제할 수 없어서,
 * 토글 OFF/로그인 자동등록 스킵 여부를 판단하려면 별도 플래그가 필요하다.
 *
 * - 'unset'   : 아직 결정 안 함 → 로그인 직후 1회 권한 요청 대상
 * - 'enabled' : 알림 사용 → 로그인 시 토큰 자동 재등록
 * - 'disabled': 알림 끔 → 자동등록하지 않음
 */
const STORAGE_KEY = 'weeth:fcm-preference';

export type FcmPreference = 'unset' | 'enabled' | 'disabled';

export function getFcmPreference(): FcmPreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'enabled' || value === 'disabled' ? value : 'unset';
  } catch {
    return 'unset';
  }
}

export function setFcmPreference(value: Exclude<FcmPreference, 'unset'>): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // 저장 실패(프라이빗 모드 등)는 무시
  }
}
