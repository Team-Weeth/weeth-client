import { logoutAction } from '@/lib/actions/auth';
import { revokeCurrentToken } from '@/lib/push/webPush';

function clearClientCookies() {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0]?.trim();
    if (!name) return;

    document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
  });
}

function clearBrowserStorage() {
  localStorage.clear();
  sessionStorage.clear();
  clearClientCookies();
}

export function useLogout() {
  return async () => {
    // 쿠키/스토리지 정리 전에 FCM 토큰 해제 (revoke API가 인증 쿠키를 필요로 함)
    await revokeCurrentToken();
    clearBrowserStorage();
    await logoutAction();
  };
}
