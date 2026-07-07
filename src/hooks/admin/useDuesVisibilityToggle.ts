import { useState } from 'react';

import { useUpdateMemberVisibility } from '@/hooks/mutations/admin/useAdminDuesMutations';
import { toastError } from '@/stores/useToastStore';

/**
 * 회비 내역 공개 여부 토글 상태 + 낙관적 업데이트 훅.
 *
 * 스위치는 즉시 반영하고, 서버 요청이 실패하면 이전 값으로 되돌린다.
 *
 * TODO: 대시보드 응답에 부원 공개 여부(member-visibility) 필드가 추가되면
 * useState(true) 기본값 대신 서버 값으로 초기화할 것(백엔드 대기 중).
 */
export function useDuesVisibilityToggle(clubId: string, accountId: number | null) {
  const [isPublic, setIsPublic] = useState(true);

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
