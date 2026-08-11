'use client';

import QuestionMarkIcon from '@/assets/icons/question_mark.svg';
import { Icon } from '@/components/ui';

interface HomeTutorialButtonProps {
  onClick: () => void;
}

function HomeTutorialButton({ onClick }: HomeTutorialButtonProps) {
  return (
    <button
      type="button"
      aria-label="홈 튜토리얼 다시 보기"
      onClick={onClick}
      className="bg-background-2 fixed right-[18px] bottom-[18px] z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-[40px] p-[10px] shadow-sm transition-transform"
    >
      <Icon src={QuestionMarkIcon} size={28} className="text-icon-normal" alt="튜토리얼" />
    </button>
  );
}

export { HomeTutorialButton };
