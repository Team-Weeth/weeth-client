import { useHomeQuery } from '@/hooks/home/useHomeQuery';

export function useIsAdmin() {
  const {
    data: role,
    isPending,
    isError,
  } = useHomeQuery({
    select: (data) => data.myInfo.userInfo.role,
  });

  return {
    isAdmin: role === 'ADMIN' || role === 'LEAD',
    isPending,
    isError,
  };
}
