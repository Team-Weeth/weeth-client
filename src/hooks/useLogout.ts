import { logoutAction } from '@/lib/actions/auth';

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
    clearBrowserStorage();
    await logoutAction();
  };
}
