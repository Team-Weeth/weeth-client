import { logoutAction } from '@/lib/actions/auth';

// localStorage 키는 userId를 포함하므로 공용 브라우저에서도 다른 계정으로 새어나가지 않는다.
const PRESERVED_LOCAL_STORAGE_KEYS = ['weeth-tour', 'weeth-theme'];

function clearClientCookies() {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0]?.trim();
    if (!name) return;

    document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
  });
}

function clearBrowserStorage() {
  const preserved = PRESERVED_LOCAL_STORAGE_KEYS.map(
    (key) => [key, localStorage.getItem(key)] as const,
  );
  localStorage.clear();
  sessionStorage.clear();
  preserved.forEach(([key, value]) => {
    if (value !== null) localStorage.setItem(key, value);
  });
  clearClientCookies();
}

export function useLogout() {
  return async () => {
    clearBrowserStorage();
    await logoutAction();
  };
}
