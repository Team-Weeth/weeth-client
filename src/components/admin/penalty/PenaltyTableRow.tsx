import type { ReactNode } from 'react';

import { MemberSelectionCheckbox } from '@/components/admin/member/MemberSelectionCheckbox';
import { Avatar, AvatarFallback, TableCell, TableRow } from '@/components/ui';
import { PENALTY_COLUMN_WIDTH } from '@/constants/admin/penaltyTable.constants';
import { cn } from '@/lib/cn';
import type { PenaltyMember } from '@/types/admin/penalty';
import { formatCardinalLabel, getVisibleMemberCardinals } from '@/utils/admin/memberTableUtils';
import { formatPenaltyDate, truncateIntroduction } from '@/utils/admin/penaltyPageUtils';
import { CardinalTag } from './PenaltyCardinalTag';

interface PenaltyTableRowProps {
  member: PenaltyMember;
  selected: boolean;
  onToggle: (id: string) => void;
  onOpenDetail: (member: PenaltyMember) => void;
}

function PenaltyTableRow({ member, selected, onToggle, onOpenDetail }: PenaltyTableRowProps) {
  const { visibleCardinals, hiddenCardinalCount } = getVisibleMemberCardinals(member.cardinal);

  return (
    <TableRow
      className={cn(
        'bg-container-neutral [&>td]:border-line h-16 cursor-pointer border-0 hover:bg-neutral-200 [&:last-child>td]:border-b-0 [&>td]:border-b [&>td]:bg-transparent',
        selected && 'bg-container-primary-alternative hover:bg-container-primary-alternative',
      )}
      onClick={() => onOpenDetail(member)}
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

      <TableCell className={cn('h-16 p-0 pr-400', PENALTY_COLUMN_WIDTH.profile)}>
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

      <PenaltyTextCell className={PENALTY_COLUMN_WIDTH.role}>{member.position}</PenaltyTextCell>
      <PenaltyTextCell className={PENALTY_COLUMN_WIDTH.department}>
        {member.department}
      </PenaltyTextCell>

      <TableCell className={cn('h-16 p-0 px-100 py-300 text-center', PENALTY_COLUMN_WIDTH.penalty)}>
        <span className="typo-body2 text-text-strong">{member.penaltyCount}</span>
      </TableCell>

      <PenaltyTextCell className={PENALTY_COLUMN_WIDTH.recentPenalty}>
        {formatPenaltyDate(member.recentPenaltyAt)}
      </PenaltyTextCell>

      <TableCell className={cn('h-16 p-0 px-400 py-[7px]', PENALTY_COLUMN_WIDTH.cardinal)}>
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

function PenaltyTextCell({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <TableCell className={cn('h-16 p-0 px-400 py-300', className)}>
      <span className="typo-body2 text-text-strong block truncate">{children}</span>
    </TableCell>
  );
}

export { PenaltyTableRow, type PenaltyTableRowProps };
