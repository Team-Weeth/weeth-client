import type { ReactNode } from 'react';

import { Avatar, AvatarFallback, TableCell } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatCardinalLabel, getVisibleMemberCardinals } from '@/utils/admin/memberTableUtils';

/** 기수 배지. 멤버·페널티 등 어드민 테이블에서 공용으로 사용한다. */
function CardinalTag({ children }: { children: ReactNode }) {
  return (
    <span className="bg-container-neutral-alternative text-text-alternative rounded-[5px] px-2.5 py-[5px] text-[14px] leading-5 font-semibold tracking-[var(--letter-spacing)] whitespace-nowrap">
      {children}
    </span>
  );
}

function AdminTextCell({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <TableCell className={cn('h-16 p-0 px-400 py-300', className)}>
      <span className="typo-body2 text-text-strong block truncate">{children}</span>
    </TableCell>
  );
}

function AdminNumberCell({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <TableCell className={cn('h-16 w-12 p-0 px-100 py-300 text-center', className)}>
      <span className="typo-body2 text-text-strong">{children}</span>
    </TableCell>
  );
}

function AdminProfileCell({
  name,
  description,
  className,
}: {
  name: string;
  description: ReactNode;
  className?: string;
}) {
  return (
    <TableCell className={cn('h-16 p-0 pr-400', className)}>
      <div className="flex min-w-0 items-center gap-300">
        <Avatar size={40}>
          <AvatarFallback />
        </Avatar>
        <div className="flex min-w-0 flex-col justify-center gap-0.5">
          <span className="typo-button2 text-text-normal truncate">{name}</span>
          <span className="typo-caption2 text-text-alternative truncate">{description}</span>
        </div>
      </div>
    </TableCell>
  );
}

/** 활동기수 목록을 배지로 보여주고, 넘치는 개수는 '+N'으로 접는다. */
function AdminCardinalsCell({ cardinal, className }: { cardinal: string; className?: string }) {
  const { visibleCardinals, hiddenCardinalCount } = getVisibleMemberCardinals(cardinal);

  return (
    <TableCell className={cn('h-16 w-[182px] p-0 px-400 py-[7px]', className)}>
      <div className="flex items-center gap-100 overflow-hidden">
        {visibleCardinals.map((item) => (
          <CardinalTag key={item}>{formatCardinalLabel(item)}</CardinalTag>
        ))}
        {hiddenCardinalCount > 0 && <CardinalTag>+{hiddenCardinalCount}</CardinalTag>}
      </div>
    </TableCell>
  );
}

export { AdminCardinalsCell, AdminNumberCell, AdminProfileCell, AdminTextCell, CardinalTag };
