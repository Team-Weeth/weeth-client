import { useEffect, useState } from 'react';

import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { useSetCommentDirty } from '@/stores/useCommentDirtyStore';
import { useDirtyActionGuard } from '@/hooks/board/useDirtyActionGuard';

/**
 * 대댓글 폼을 관리하는 훅
 */
function useReplyForm() {
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [isReplyDirty, setIsReplyDirty] = useState(false);
  const [isCommentDirty, setIsCommentDirty] = useState(false);

  const isDirty = isCommentDirty || isReplyDirty;
  const setCommentDirty = useSetCommentDirty();

  // 글로벌 dirty store 동기화
  useEffect(() => {
    setCommentDirty(isDirty);
    return () => setCommentDirty(false);
  }, [isDirty, setCommentDirty]);

  // 대댓글 폼 전환 guard
  const switchGuard = useDirtyActionGuard(isReplyDirty);

  // 닫기 액션을 구분하기 위한 sentinel
  const CLOSE_SENTINEL = -1;

  const handleReplyToggle = (commentId: number) => {
    if (activeReplyId === commentId) {
      if (switchGuard.requestAction(CLOSE_SENTINEL)) return;

      setActiveReplyId(null);
      setIsReplyDirty(false);
      return;
    }

    if (switchGuard.requestAction(commentId)) return;

    setActiveReplyId(commentId);
    setIsReplyDirty(false);
  };

  const onSwitchConfirm = () => {
    const id = switchGuard.confirm();
    setActiveReplyId(id === CLOSE_SENTINEL ? null : id);
    setIsReplyDirty(false);
  };

  const onSwitchCancel = () => {
    switchGuard.cancel();
  };

  // 네비게이션 guard
  const {
    open: navGuardOpen,
    onConfirm: onNavGuardConfirm,
    onCancel: onNavGuardCancel,
  } = useNavigationGuard({ enabled: isDirty });

  return {
    activeReplyId,
    setIsReplyDirty,
    setIsCommentDirty,
    handleReplyToggle,
    switchGuardOpen: switchGuard.guardOpen,
    onSwitchConfirm,
    onSwitchCancel,
    navGuardOpen,
    onNavGuardConfirm,
    onNavGuardCancel,
  };
}

export { useReplyForm };
