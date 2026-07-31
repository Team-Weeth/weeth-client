import { useQuery } from '@tanstack/react-query';

import { adminMemberApi } from '@/lib/apis/adminMember';
import type { Member } from '@/types/admin/member';
import type { PageResponse } from '@/types/common';
import { toMember } from '@/utils/admin/memberMapper';
import { useClubId } from '@/stores';
import { adminQueryKeys } from './adminQueryKeys';

const EMPTY_MEMBER_PAGE: PageResponse<Member> = {
  content: [],
  pageNumber: 0,
  pageSize: 10,
  numberOfElements: 0,
  hasNext: false,
  totalElements: 0,
  totalPages: 0,
};

export function useAdminMembers(pageNumber = 0, pageSize = 10) {
  const clubId = useClubId();

  return useQuery({
    queryKey: [...adminQueryKeys.members(clubId), pageNumber, pageSize],
    queryFn: async () => {
      const res = await adminMemberApi.getMembers(clubId!, { pageNumber, pageSize });
      const page = res.data.data;

      return {
        ...page,
        content: page.content.map(toMember),
      };
    },
    placeholderData: (previousData) => previousData,
    enabled: !!clubId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export { EMPTY_MEMBER_PAGE };
