'use client';

import { ArrowLeftIcon, ArrowRightIcon } from '@/assets/icons';
import { Button, Icon } from '@/components/ui';

interface HomeOnboardingPaginationProps {
  currentIndex: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}

function HomeOnboardingPagination({
  currentIndex,
  total,
  onPrevious,
  onNext,
}: HomeOnboardingPaginationProps) {
  return (
    <div className="flex items-center justify-center gap-600">
      <Button
        variant="tertiary"
        size="icon-sm"
        onClick={onPrevious}
        disabled={currentIndex === 0}
        aria-label="이전 온보딩"
        className="text-icon-alternative h-10 w-10 rounded-full"
      >
        <Icon src={ArrowLeftIcon} size={24} />
      </Button>
      <div className="typo-h3 text-text-strong min-w-[92px] text-center">
        {currentIndex + 1} / {total}
      </div>
      <Button
        variant="tertiary"
        size="icon-sm"
        onClick={onNext}
        disabled={currentIndex === total - 1}
        aria-label="다음 온보딩"
        className="text-icon-alternative h-10 w-10 rounded-full"
      >
        <Icon src={ArrowRightIcon} size={24} />
      </Button>
    </div>
  );
}

export { HomeOnboardingPagination };
