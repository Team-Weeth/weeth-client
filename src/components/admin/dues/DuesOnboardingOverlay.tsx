'use client';

import { cn } from '@/lib/cn';
import { DuesOnboardingContent } from './DuesOnboardingContent';

interface DuesOnboardingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  onStart?: () => void;
}

// 미등록 기수 진입 시 콘텐츠 영역만 덮는 온보딩 안내 오버레이.
// 전체 화면 모달과 달리 상단 기수 필터/드롭다운은 가리지 않아 다른 기수 조회가 가능하다.
function DuesOnboardingOverlay({ className, onStart, ...props }: DuesOnboardingOverlayProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/40 px-400 py-600 backdrop-blur-sm',
        className,
      )}
      {...props}
    >
      <div className="bg-background w-97.5 max-w-[calc(100%-2rem)] overflow-hidden rounded-lg">
        <DuesOnboardingContent onStart={onStart} />
      </div>
    </div>
  );
}

export { DuesOnboardingOverlay, type DuesOnboardingOverlayProps };
