import { useQueryClient } from '@tanstack/react-query';

import { useDuesSetupActions } from '@/stores/useDuesSetupStore';
import {
  duesRegistrationStatusQueryOptions,
  duesPaymentTargetsQueryOptions,
} from '@/hooks/queries/admin';

import { useDuesSetupNavigation } from '@/hooks/admin/useDuesSetupNavigation';

import type { DuesBasicFormData } from '@/lib/schemas/duesSetup';

// 서버 registrationStep(문자열) → 온보딩 스텝 번호 매핑
const STEP_MAP: Record<string, number> = {
  BASIC: 1,
  PAYMENT_TARGET: 2,
  CARRY_OVER: 3,
  BANK_ACCOUNT: 4,
  REVIEW: 5,
};

interface RestoreDuesDraftOptions {
  // 기본 정보 복원 시 호출 — Step1의 rhf 폼을 복원 값으로 리셋하는 용도.
  onBasicRestored?: (values: DuesBasicFormData) => void;
}

/**
 * "이어서 작성"(draft 복원) 진입점 훅.
 *
 * Step1에서 트리거되지만, 저장돼 있던 초안의 모든 단계 데이터(기본/납부 대상/이월/계좌)를
 * store에 한 번에 rehydrate한 뒤 서버가 알려준 마지막 작성 단계로 점프한다.
 * 점프한 스텝이 store 값을 읽어 화면을 그리므로 이동 전에 전체 상태를 채워두어야 한다.
 *
 * 사용자 인터랙션으로 트리거되는 lazy 복원이라 useQuery 대신 fetchQuery로 조회하며,
 * 캐시 키는 Step2/3의 useQuery와 공유한다.
 */
function useRestoreDuesDraft(clubId: string, accountId: number | null, cardinalNumber: number) {
  const queryClient = useQueryClient();
  const { goToStep } = useDuesSetupNavigation();
  const { setField } = useDuesSetupActions();

  const restoreDraft = async ({ onBasicRestored }: RestoreDuesDraftOptions = {}) => {
    if (accountId === null) return;

    const status = await queryClient
      .fetchQuery(duesRegistrationStatusQueryOptions(clubId, accountId))
      .catch(() => null);
    if (!status) return;

    const { registrationStep, basic, carryOver, bankAccount } = status;

    setField({ cardinalNumber });

    if (basic) {
      const basicValues: DuesBasicFormData = {
        name: basic.name,
        amount: String(basic.duesAmount),
        description: basic.description ?? '',
      };
      setField(basicValues);
      onBasicRestored?.(basicValues);
    }

    if (carryOver) {
      setField({
        carryOverOption: carryOver.enabled ? 'carry' : 'none',
        carryOverAmount: carryOver.amount ? String(carryOver.amount) : '',
        carryOverDescription: carryOver.memo ?? '',
        carryOverInitialized: true,
      });
    }

    if (bankAccount) {
      setField({
        isAccountPublic: bankAccount.bankAccountVisible,
        bankName: bankAccount.bankAccount?.bankName ?? '',
        accountNumber: bankAccount.bankAccount?.accountNumber ?? '',
        accountHolder: bankAccount.bankAccount?.holder ?? '',
        accountGuide: bankAccount.bankAccount?.guide ?? '',
      });
    }

    // 납부 대상은 status 응답에 멤버 ID가 없어(개수만 제공) 목록 API로 별도 복원한다.
    const targetsData = await queryClient
      .fetchQuery(duesPaymentTargetsQueryOptions(clubId, accountId))
      .catch(() => null);
    if (targetsData) {
      const targetedIds = targetsData.targets.content
        .filter((t) => t.targetStatus === 'TARGETED')
        .map((t) => t.paymentTargetInfo.clubMemberId);
      setField({ selectedMemberIds: targetedIds, memberIdsInitialized: true });
    }

    const targetStep = STEP_MAP[registrationStep] ?? 1;
    if (targetStep > 1) {
      goToStep(targetStep);
    }
  };

  return restoreDraft;
}

export { useRestoreDuesDraft };
