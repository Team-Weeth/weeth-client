import { useState } from 'react';

import { useUpdateMemberVisibility } from '@/hooks/mutations/admin/useAdminDuesMutations';
import { toastError } from '@/stores/useToastStore';

/**
 * 회비 내역 공개 여부 토글 상태 + 낙관적 업데이트 훅.
 *
 * 대시보드 응답의 `bankAccountPublic`으로 초기화하고, 이후 서버 값이 바뀌면
 * (기수 변경·mutation 후 refetch) 렌더 중에 로컬 토글 상태를 재동기화한다.
 * 스위치는 즉시 반영하고, 서버 요청이 실패하면 이전 값으로 되돌린다.
 */
export function useDuesVisibilityToggle(
  clubId: string,
  accountId: number | null,
  serverIsPublic: boolean | undefined,
) {
  const [isPublic, setIsPublic] = useState(serverIsPublic ?? true);
  const [syncedValue, setSyncedValue] = useState(serverIsPublic);

  // 서버 값이 도착/변경되면 서버 기준으로 재동기화 (낙관적 토글은 그대로 두기 위해 값 변화 시에만)
  if (serverIsPublic !== undefined && serverIsPublic !== syncedValue) {
    setSyncedValue(serverIsPublic);
    setIsPublic(serverIsPublic);
  }

  const { mutate: updateMemberVisibility } = useUpdateMemberVisibility(clubId, accountId, {
    onError: () => toastError('공개 설정 변경에 실패했습니다.'),
  });

  const handlePublicChange = (value: boolean) => {
    setIsPublic(value);
    updateMemberVisibility(value, {
      onError: () => setIsPublic(!value),
    });
  };

  return { isPublic, handlePublicChange };
}
