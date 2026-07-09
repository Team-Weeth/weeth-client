import { useEffect, useRef, useState } from 'react';

import { useUpdateMemberVisibility } from '@/hooks/mutations/admin/useAdminDuesMutations';
import { toastError } from '@/stores/useToastStore';

/** 연타 시 마지막 값만 서버로 전송하기까지의 대기 시간(ms) */
const TOGGLE_DEBOUNCE_MS = 300;

/**
 * 회비 내역 공개 여부 토글 상태 + 낙관적 업데이트 훅.
 *
 * 대시보드 응답의 `bankAccountPublic`으로 초기화하고, 이후 서버 값이 바뀌면
 * (기수 변경·mutation 후 refetch) 렌더 중에 로컬 토글 상태를 재동기화한다.
 * 스위치는 즉시 반영하고, 실제 요청은 debounce하여 연타의 마지막 값만 전송한다.
 * 요청이 실패하면 서버 값 기준으로 되돌린다.
 */
export function useDuesVisibilityToggle(
  clubId: string,
  accountId: number | null,
  serverIsPublic: boolean | undefined,
) {
  const [isPublic, setIsPublic] = useState(serverIsPublic ?? true);
  const [syncedValue, setSyncedValue] = useState(serverIsPublic);
  // debounce 콜백이 타이머 설정 시점의 stale한 syncedValue를 참조하지 않도록 ref로 미러링한다.
  const syncedValueRef = useRef(syncedValue);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 서버 값이 도착/변경되면 서버 기준으로 재동기화 (낙관적 토글은 그대로 두기 위해 값 변화 시에만)
  if (serverIsPublic !== undefined && serverIsPublic !== syncedValue) {
    setSyncedValue(serverIsPublic);
    setIsPublic(serverIsPublic);
    syncedValueRef.current = serverIsPublic;
  }

  const { mutate: updateMemberVisibility } = useUpdateMemberVisibility(clubId, accountId, {
    onError: () => toastError('공개 설정 변경에 실패했습니다.'),
  });

  // 언마운트 후 대기 중인 debounce 타이머가 mutation을 실행하지 않도록 정리한다.
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // 스위치는 즉시 반영하고, 서버 요청만 debounce하여 연타의 마지막 값만 보낸다.
  const handlePublicChange = (value: boolean) => {
    setIsPublic(value);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      // 연타로 서버 값과 같아졌으면(원위치) 불필요한 요청을 생략한다.
      if (value === syncedValueRef.current) return;
      updateMemberVisibility(value, {
        onError: () => setIsPublic(syncedValueRef.current ?? !value),
      });
    }, TOGGLE_DEBOUNCE_MS);
  };

  return { isPublic, handlePublicChange };
}
