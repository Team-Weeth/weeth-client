import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminQueryKeys } from '@/hooks/queries/admin/adminQueryKeys';
import { adminPositionApi } from '@/lib/apis/adminPosition';
import { useClubId } from '@/stores';
import type { MemberPositionOption } from '@/types/admin/memberPosition';
import { toSavePositionOptionsBody } from '@/utils/admin/memberPositionMapper';

/** 포지션 옵션 전체 저장(PUT). 저장 후 서버가 새 id를 발급하므로 목록을 다시 받아온다. */
export function useSavePositionOptions() {
  const queryClient = useQueryClient();
  const clubId = useClubId();

  return useMutation({
    mutationFn: (options: MemberPositionOption[]) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminPositionApi.saveOptions(clubId, toSavePositionOptionsBody(options));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.positions(clubId) });
      // 멤버 표의 포지션 태그도 삭제/이름 변경을 반영해야 한다.
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.members(clubId) });
    },
  });
}
