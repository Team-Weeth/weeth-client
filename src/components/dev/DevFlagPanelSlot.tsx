import { LazyDevFlagPanel } from '@/components/dev/LazyDevFlagPanel';
import { isDevFlagOverrideEnabled } from '@/flags/club-features/dev-overrides';
import { getDevFlagOverrides } from '@/flags/club-features/server';

/** 덮어쓰기가 허용된 환경(로컬·dev 배포)에서만 개발용 플래그 패널을 그린다. */
async function DevFlagPanelSlot({ clubId }: { clubId: string }) {
  if (!isDevFlagOverrideEnabled()) return null;

  return <LazyDevFlagPanel clubId={clubId} overrides={await getDevFlagOverrides()} />;
}

export { DevFlagPanelSlot };
