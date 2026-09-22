'use client';

import { cn } from '@/lib/cn';
import type { MemberStatus } from '@/types/admin/member';

const STATUS_LABEL: Record<MemberStatus, string> = {
  ACTIVE: '활동',
  BANNED: '퇴출',
  LEFT: '탈퇴',
};

const STATUS_DOT_COLOR: Record<MemberStatus, string> = {
  ACTIVE: 'text-brand-primary',
  BANNED: 'text-state-error',
  LEFT: 'text-text-disabled',
};

const STATUS_PILL_COLOR: Record<MemberStatus, string> = {
  ACTIVE: 'bg-container-primary text-text-inverse',
  BANNED: 'bg-state-error text-text-inverse',
  LEFT: 'bg-button-neutral-interaction text-text-inverse',
};

interface MemberStatusBadgeProps {
  status: MemberStatus;
  variant?: 'dot' | 'pill';
  className?: string;
}

function MemberStatusBadge({ status, variant = 'pill', className }: MemberStatusBadgeProps) {
  const label = STATUS_LABEL[status];

  if (variant === 'dot') {
    return (
      <span
        className={cn(
          'typo-caption1 inline-flex items-center gap-[6px]',
          STATUS_DOT_COLOR[status],
          className,
        )}
      >
        <span className="size-[6px] rounded-full bg-current" aria-hidden />
        {label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex h-[30px] items-center justify-center rounded-[99px] px-[13px] py-100 text-[14px] leading-5 font-semibold tracking-[var(--letter-spacing)]',
        STATUS_PILL_COLOR[status],
        className,
      )}
    >
      {label}
    </span>
  );
}

export { MemberStatusBadge, type MemberStatusBadgeProps };
