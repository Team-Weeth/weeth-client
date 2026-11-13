import { logoutAction } from '@/lib/actions/auth';
import { useFeedbackChatStore } from '@/stores/useFeedbackChatStore';

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
    // 서버 액션 redirect는 클라이언트 이동이라 메모리 상태가 남으므로, 다른 계정에 이전 대화가 보이지 않게 비운다.
    useFeedbackChatStore.getState().reset();
    await logoutAction();
  };
}
