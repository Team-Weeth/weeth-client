import { useState } from 'react';

/**
 * dirty 상태일 때 액션을 가로채 확인을 요청하는 범용 훅.
 */
function useDirtyActionGuard(isDirty: boolean) {
  const [pendingAction, setPendingAction] = useState<number | null>(null);

  const guardOpen = pendingAction !== null;

  const requestAction = (id: number): boolean => {
    if (isDirty) {
      setPendingAction(id);
      return true;
    }
    return false;
  };

  const confirm = (): number | null => {
    const action = pendingAction;
    setPendingAction(null);
    return action;
  };

  const cancel = () => {
    setPendingAction(null);
  };

  return { pendingAction, guardOpen, requestAction, confirm, cancel };
}

export { useDirtyActionGuard };
