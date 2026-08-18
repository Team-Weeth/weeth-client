import type { ReactNode } from 'react';

import { MemberSelectionCheckbox } from '@/components/admin';
import { Avatar, AvatarFallback, TableCell, TableRow } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { PenaltyMember } from '@/types/admin/penalty';
import { formatCardinalLabel, getVisibleMemberCardinals } from '@/utils/admin/memberTableUtils';
import { formatPenaltyDate, truncateIntroduction } from '@/utils/admin/penaltyPageUtils';

interface PenaltyTableRowProps {
  member: PenaltyMember;
  selected: boolean;
  onToggle: (id: string) => void;
}

function PenaltyTableRow({ member, selected, onToggle }: PenaltyTableRowProps) {
  const { visibleCardinals, hiddenCardinalCount } = getVisibleMemberCardinals(member.cardinal);

  return (
    <TableRow
      className={cn(
        'bg-container-neutral [&>td]:border-line h-16 cursor-pointer border-0 hover:bg-neutral-200 [&:last-child>td]:border-b-0 [&>td]:border-b [&>td]:bg-transparent',
        selected && 'bg-container-primary-alternative hover:bg-container-primary-alternative',
      )}
      onClick={() => onToggle(member.id)}
    >
      <TableCell
        className="h-16 w-16 min-w-16 p-0 pl-300"
        onClick={(event) => event.stopPropagation()}
      >
        <MemberSelectionCheckbox
          checked={selected}
          ariaLabel={`${member.name} 선택`}
          onClick={() => onToggle(member.id)}
        />
      </TableCell>

      <TableCell className="h-16 w-[220px] p-0 pr-400">
        <div className="flex min-w-0 items-center gap-300">
          <Avatar size={40}>
            <AvatarFallback />
          </Avatar>
          <div className="flex min-w-0 flex-col justify-center gap-0.5">
            <span className="typo-button2 text-text-normal truncate">{member.name}</span>
            <span className="typo-caption2 text-text-alternative truncate">
              {truncateIntroduction(member.introduction)}
            </span>
          </div>
        </div>
      </TableCell>

      <PenaltyTextCell className="w-[126px]">{member.position}</PenaltyTextCell>
      <PenaltyTextCell className="w-[214px]">{member.department}</PenaltyTextCell>

      <TableCell className="h-16 w-[52px] p-0 px-100 py-300 text-center">
        <span className="typo-body2 text-text-strong">{member.penaltyCount}</span>
      </TableCell>

      <PenaltyTextCell className="w-[126px]">
        {formatPenaltyDate(member.recentPenaltyAt)}
      </PenaltyTextCell>

      <TableCell className="h-16 w-[182px] p-0 px-400 py-[7px]">
        <div className="flex items-center gap-100 overflow-hidden">
          {visibleCardinals.map((item) => (
            <CardinalTag key={item}>{formatCardinalLabel(item)}</CardinalTag>
          ))}
          {hiddenCardinalCount > 0 && <CardinalTag>+{hiddenCardinalCount}</CardinalTag>}
        </div>
      </TableCell>

    </TableRow>
  );
}

function CardinalTag({ children }: { children: ReactNode }) {
  return (
    <span className="bg-container-neutral-alternative text-text-alternative rounded-[5px] px-2.5 py-[5px] text-[14px] leading-5 font-semibold tracking-[var(--letter-spacing)] whitespace-nowrap">
      {children}
    </span>
  );
}

function PenaltyTextCell({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <TableCell className={cn('h-16 p-0 px-400 py-300', className)}>
      <span className="typo-body2 text-text-strong block truncate">{children}</span>
    </TableCell>
  );
}

export { PenaltyTableRow, type PenaltyTableRowProps };
