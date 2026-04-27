import { logoutAction } from '@/lib/actions/auth';
import { useClubActions } from '@/stores/useClubStore';

export function useLogout() {
  const { reset } = useClubActions();

  return async () => {
    reset();
    await logoutAction();
  };
}
