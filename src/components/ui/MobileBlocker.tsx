import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface MobileBlockerProps {
  className?: string;
  action: ReactNode;
}

function MobileBlocker({ className, action }: MobileBlockerProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center gap-400 px-300 text-center break-keep tablet:px-400',
        className,
      )}
    >
      <div className="flex flex-col gap-200">
        <h2 className="typo-sub1 text-text-strong">PC 버전으로 접속해주세요</h2>
        <p className="typo-body2 text-text-alternative">
          현재 모바일 버전은 제공되지 않아요. PC 환경에서 해당 서비스에 접속해 주세요!
        </p>
      </div>
      {action}
    </div>
  );
}

export { MobileBlocker, type MobileBlockerProps };
