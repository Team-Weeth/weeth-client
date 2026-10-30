import { logoutAction } from '@/lib/actions/auth';
import { useFeedbackChatStore } from '@/stores/useFeedbackChatStore';

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
    // 서버 액션 redirect는 클라이언트 이동이라 메모리 상태가 남으므로, 다른 계정에 이전 대화가 보이지 않게 비운다.
    useFeedbackChatStore.getState().reset();
    await logoutAction();
  };
}
