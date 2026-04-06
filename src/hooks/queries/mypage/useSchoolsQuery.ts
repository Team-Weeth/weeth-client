import { useQuery } from '@tanstack/react-query';
import { universityApi } from '@/lib/apis/university';

export function useSchoolsQuery() {
  return useQuery({
    queryKey: ['university', 'schools'],
    queryFn: () => universityApi.getSchools().then((res) => res.data.data),
    staleTime: 60 * 60 * 1000,
    gcTime: 120 * 60 * 1000,
  });
}
