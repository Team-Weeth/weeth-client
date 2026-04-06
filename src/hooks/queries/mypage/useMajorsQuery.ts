import { useQuery } from '@tanstack/react-query';
import { universityApi } from '@/lib/apis/university';

export function useMajorsQuery() {
  return useQuery({
    queryKey: ['university', 'majors'],
    queryFn: () => universityApi.getMajors().then((res) => res.data.data),
    staleTime: Infinity,
    gcTime: 120 * 60 * 1000,
  });
}
