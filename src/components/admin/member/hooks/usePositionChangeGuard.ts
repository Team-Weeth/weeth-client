'use client';

import { useState } from 'react';

import { useAdminPositionOptions } from '@/hooks/queries/admin/useAdminPositionQueries';
import { toastError, toastWarning } from '@/stores/useToastStore';
import { useMemberPositionSettingsLink } from './useMemberPositionSettingsLink';

/**
 * 포지션 변경을 열기 전에 옵션 상태를 확인한다.
 * 조회에 성공했는데 옵션이 없을 때만 '옵션 없음' 안내를 띄우고, 조회 실패는 토스트로 구분해 알린다.
 * 선택바의 일괄 변경과 상세 모달의 단건 변경이 같은 판단과 안내를 공유한다.
 */
export function usePositionChangeGuard() {
  const { data: options = [], status } = useAdminPositionOptions();
  const [isEmptyDialogOpen, setIsEmptyDialogOpen] = useState(false);
  const goToPositionSettings = useMemberPositionSettingsLink();

  /** 열어도 되면 true. 열 수 없으면 상황에 맞는 안내를 띄우고 false. */
  const ensureOptions = () => {
    if (status === 'error') {
      toastError('포지션 옵션을 불러오지 못했습니다.');
      return false;
    }

    // 조회 중에 열면 목록이 비어 '지정 해제'만 있는 모달이 뜬다. 그대로 저장하면 포지션이 풀린다.
    if (status === 'pending') {
      toastWarning('포지션 옵션을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return false;
    }

    if (options.length === 0) {
      setIsEmptyDialogOpen(true);
      return false;
    }

    return true;
  };

  return {
    options,
    ensureOptions,
    emptyDialogProps: {
      open: isEmptyDialogOpen,
      onOpenChange: setIsEmptyDialogOpen,
      onGoToSettings: goToPositionSettings,
    },
  };
}
