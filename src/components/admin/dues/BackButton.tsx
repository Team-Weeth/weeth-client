'use client';

import { BackIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import { useDuesSetupNavigation } from './setup/useDuesSetupNavigation';

function BackButton() {
  const { goToDues } = useDuesSetupNavigation();
  return (
    <button
      type="button"
      onClick={goToDues}
      aria-label="뒤로가기"
      className="bg-button-neutral hover:bg-container-neutral-interaction flex w-fit cursor-pointer items-center justify-center rounded-sm p-200"
    >
      <Icon src={BackIcon} alt="뒤로가기" size={18} />
    </button>
  );
}

export { BackButton };
