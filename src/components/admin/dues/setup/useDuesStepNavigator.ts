import { useDuesSetupValues, useDuesSetupActions } from '@/stores/useDuesSetupStore';
import { useDuesSetupNavigation } from '@/components/admin/dues/setup/useDuesSetupNavigation';

const LAST_STEP = 5;

/**
 * 온보딩 단계 이동 공통 훅.
 *
 * - "다음으로"와 인디케이터 점프 모두 `commitStep`(검증 + 저장)을 먼저 실행하고,
 *   성공했을 때만 이동한다. (점프 시에도 현재 단계 저장 보장)
 * - 도달한 최고 단계(maxReachedStep)까지 자유롭게 앞뒤 이동할 수 있다.
 *
 * @param currentStep 현재 단계 번호 (1~5)
 * @param commitStep  현재 단계 검증 + 저장. 성공 시 true, 검증 실패 등으로 이동을 막아야 하면 false 반환.
 */
function useDuesStepNavigator(currentStep: number, commitStep: () => Promise<boolean> | boolean) {
  const { goToStep } = useDuesSetupNavigation();
  const { maxReachedStep } = useDuesSetupValues();
  const { setField } = useDuesSetupActions();

  const goNext = async () => {
    if (!(await commitStep())) return;
    const next = Math.min(currentStep + 1, LAST_STEP);
    setField({ maxReachedStep: Math.max(maxReachedStep, next) });
    goToStep(next);
  };

  const goToReachedStep = async (target: number) => {
    if (target === currentStep || target > maxReachedStep) return;
    if (!(await commitStep())) return;
    goToStep(target);
  };

  return { maxReachedStep, goNext, goToReachedStep };
}

export { useDuesStepNavigator };
