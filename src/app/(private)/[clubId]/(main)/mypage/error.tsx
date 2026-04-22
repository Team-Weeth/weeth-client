'use client';

import { Button } from '@/components/ui';

export default function MyPageError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-400">
      <p className="typo-body1 text-state-error">내 정보를 불러올 수 없습니다.</p>
      <Button variant="secondary" size="md" onClick={reset}>
        다시 시도
      </Button>
    </div>
  );
}
