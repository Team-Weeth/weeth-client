import { useEffect } from 'react';

import { useDuesSetupValues, useDuesSetupActions } from '@/stores/useDuesSetupStore';
import { useCreateDuesDraft } from '@/hooks/mutations/admin';

/**
 * accountId(초안 식별자)는 store에서 메모리 전용이라 새로고침 시 null이 된다.
 *
 * Step2~5에서 직접 새로고침하면 Step1의 createDraft를 거치지 않아 accountId가 없어
 * 목록 조회(skipToken)와 저장이 모두 막힌다. 이때 persist된 cardinalNumber로
 * createDraft를 재호출해 accountId를 복구한다.
 * (기존 초안이 있으면 서버가 동일 accountId를 isNew=false로 돌려주므로 안전하다.)
 *
 * Step1은 "이어서 작성" alert 등 자체 복구 로직이 있으므로 이 훅을 쓰지 않는다.
 */
function useEnsureDuesAccountId(clubId: string) {
  const { accountId, cardinalNumber } = useDuesSetupValues();
  const { setField } = useDuesSetupActions();
  const { mutate: createDraftMutate } = useCreateDuesDraft(clubId);

  useEffect(() => {
    if (accountId !== null || !cardinalNumber) return;

    createDraftMutate(cardinalNumber, {
      onSuccess: ({ accountId: id }) => setField({ accountId: id }),
    });
  }, [accountId, cardinalNumber, createDraftMutate, setField]);

  return accountId;
}

export { useEnsureDuesAccountId };
