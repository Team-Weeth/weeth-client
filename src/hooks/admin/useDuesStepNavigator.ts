import { useDuesSetupActions, useDuesSetupValues } from '@/stores/useDuesSetupStore';

import { useDuesSetupNavigation } from '@/hooks/admin/useDuesSetupNavigation';

const LAST_STEP = 5;

/**
 * 온보딩 "다음으로" 이동 공통 훅.
 *
 * `commitStep`(검증 + 저장)을 먼저 실행하고 성공했을 때만 다음 단계로 이동한다.
 *
 * 최종 확인(5)에서 편집 버튼으로 진입한 경우(`returnStep`이 설정됨)에는
 * 다음 단계 대신 저장 후 곧바로 해당 스텝(5)으로 복귀하고 편집 모드를 종료한다.
 *
 * @param currentStep 현재 단계 번호 (1~5)
 * @param commitStep  현재 단계 검증 + 저장. 성공 시 true, 검증 실패 등으로 이동을 막아야 하면 false 반환.
 */
function useDuesStepNavigator(currentStep: number, commitStep: () => Promise<boolean> | boolean) {
  const { goToStep } = useDuesSetupNavigation();
  const { returnStep } = useDuesSetupValues();
  const { setField } = useDuesSetupActions();

  const goNext = async () => {
    if (!(await commitStep())) return;
    if (returnStep !== null) {
      setField({ returnStep: null });
      goToStep(returnStep);
      return;
    }
    goToStep(Math.min(currentStep + 1, LAST_STEP));
  };

  return { goNext, isEditMode: returnStep !== null };
}

export { useDuesStepNavigator };
