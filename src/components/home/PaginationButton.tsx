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
    <div className="flex items-center justify-center gap-200">
      <Button
        variant="tertiary"
        size="icon-sm"
        onClick={onPrevious}
        disabled={currentIndex === 0}
        aria-label="이전 온보딩"
        className="text-icon-alternative"
      >
        <Icon src={ArrowLeftIcon} size={12} />
      </Button>
      <div className="typo-caption1 text-text-normal flex items-center gap-100 px-200 py-100">
        <span>{currentIndex + 1}</span>
        <span>/</span>
        <span>{total}</span>
      </div>
      <Button
        variant="tertiary"
        size="icon-sm"
        onClick={onNext}
        disabled={currentIndex === total - 1}
        aria-label="다음 온보딩"
        className="text-icon-alternative"
      >
        <Icon src={ArrowRightIcon} size={12} />
      </Button>
    </div>
  );
}

export { HomeOnboardingPagination };
