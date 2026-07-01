import { useDuesSetupNavigation } from '@/components/admin/dues/setup/useDuesSetupNavigation';

const LAST_STEP = 5;

/**
 * 온보딩 "다음으로" 이동 공통 훅.
 *
 * `commitStep`(검증 + 저장)을 먼저 실행하고 성공했을 때만 다음 단계로 이동한다.
 *
 * @param currentStep 현재 단계 번호 (1~5)
 * @param commitStep  현재 단계 검증 + 저장. 성공 시 true, 검증 실패 등으로 이동을 막아야 하면 false 반환.
 */
function useDuesStepNavigator(currentStep: number, commitStep: () => Promise<boolean> | boolean) {
  const { goToStep } = useDuesSetupNavigation();

  const goNext = async () => {
    if (!(await commitStep())) return;
    goToStep(Math.min(currentStep + 1, LAST_STEP));
  };

  return { goNext };
}

export { useDuesStepNavigator };
