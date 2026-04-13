import { useHomeQuery } from './useHomeQuery';

export function useIsAdmin() {
  const { data: role } = useHomeQuery({
    select: (data) => data.myInfo.userInfo.role,
  });

  return role === 'ADMIN' || role === 'LEAD';
}
