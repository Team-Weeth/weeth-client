import type { ReactNode } from 'react';

import { AdminMeatballIcon } from '@/assets/icons/admin';
import { Avatar, AvatarFallback, Icon, TableCell, TableRow } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { Member } from '@/types/admin/member';
import { formatCardinalLabel, getVisibleMemberCardinals } from '@/utils/admin/memberTableUtils';
import { MemberSelectionCheckbox } from './MemberSelectionCheckbox';
import { MemberStatusBadge } from './MemberStatusBadge';

interface MemberTableRowProps {
  member: Member;
  selected: boolean;
  onToggle: (id: string) => void;
  onMemberAction?: (member: Member) => void;
}

const TEXT_CELL_CLASS_BY_ID = {
  role: 'w-[118px]',
  department: 'w-[190px]',
  studentId: 'w-[138px]',
  phone: 'w-[146px]',
} as const;

const NUMBER_CELL_VALUES = ['attendance', 'absence', 'penaltyCount'] as const;

function MemberTableRow({ member, selected, onToggle, onMemberAction }: MemberTableRowProps) {
  const textCells = [
    { id: 'role', value: member.position },
    { id: 'department', value: member.department },
    { id: 'studentId', value: member.studentId },
    { id: 'phone', value: member.phone },
  ] as const;

  return (
    <TableRow
      className={cn(
        'bg-container-neutral [&>td]:border-line h-16 cursor-pointer border-0 hover:bg-neutral-200 [&:last-child>td]:border-b-0 [&>td]:border-b [&>td]:bg-transparent',
        selected && 'bg-container-primary-alternative hover:bg-container-primary-alternative',
      )}
      onClick={() => onMemberAction?.(member)}
    >
      <TableCell className="h-16 w-16 min-w-16 p-0 pl-300">
        <MemberSelectionCheckbox
          checked={selected}
          ariaLabel={`${member.name} ${member.studentId} 선택`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(member.id);
          }}
        />
      </TableCell>

      <MemberProfileCell member={member} />

      {textCells.slice(0, 3).map(({ id, value }) => (
        <MemberTextCell key={id} className={TEXT_CELL_CLASS_BY_ID[id]}>
          {value}
        </MemberTextCell>
      ))}

      {NUMBER_CELL_VALUES.map((key) => (
        <MemberNumberCell key={key}>{member[key]}</MemberNumberCell>
      ))}
      <TableCell className="h-16 w-12 p-0 px-100 py-300" aria-hidden />

      {textCells.slice(3).map(({ id, value }) => (
        <MemberTextCell key={id} className={TEXT_CELL_CLASS_BY_ID[id]}>
          {value}
        </MemberTextCell>
      ))}

      <MemberCardinalsCell cardinal={member.cardinal} />

      <TableCell className="h-16 w-[76px] p-0 px-400 py-[7px]">
        <MemberStatusBadge status={member.status} />
      </TableCell>

      <TableCell className="h-16 w-11 p-0 pr-700">
        <button
          type="button"
          className="text-icon-normal flex cursor-pointer items-center justify-center rounded-sm p-[10px]"
          aria-label="더보기"
          onClick={(e) => {
            e.stopPropagation();
            onMemberAction?.(member);
          }}
        >
          <Icon src={AdminMeatballIcon} alt="더보기" size={20} />
        </button>
      </TableCell>
    </TableRow>
  );
}

function MemberProfileCell({ member }: { member: Member }) {
  return (
    <TableCell className="h-16 w-[172px] p-0 pr-400">
      <div className="flex min-w-0 items-center gap-300">
        <Avatar size={40}>
          <AvatarFallback />
        </Avatar>
        <div className="flex min-w-0 flex-col justify-center gap-0.5">
          <span className="typo-button2 text-text-normal truncate">{member.name}</span>
          {/* 자기소개가 없는 경우 '-' 표시. TODO : api 응답에 자기소개 추가되어야 함 */}
          <span className="typo-caption2 text-text-alternative truncate">-</span>
        </div>
      </div>
    </TableCell>
  );
}

function MemberCardinalsCell({ cardinal }: { cardinal: string }) {
  const { visibleCardinals, hiddenCardinalCount } = getVisibleMemberCardinals(cardinal);

  return (
    <TableCell className="h-16 w-[182px] p-0 px-400 py-[7px]">
      <div className="flex items-center gap-100 overflow-hidden">
        {visibleCardinals.map((item) => (
          <CardinalTag key={item}>{formatCardinalLabel(item)}</CardinalTag>
        ))}
        {hiddenCardinalCount > 0 && <CardinalTag>+{hiddenCardinalCount}</CardinalTag>}
      </div>
    </TableCell>
  );
}

function CardinalTag({ children }: { children: ReactNode }) {
  return (
    <span className="bg-container-neutral-alternative text-text-alternative rounded-[5px] px-2.5 py-[5px] text-[14px] leading-5 font-semibold tracking-[var(--letter-spacing)] whitespace-nowrap">
      {children}
    </span>
  );
}

function MemberTextCell({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <TableCell className={cn('h-16 p-0 px-400 py-300', className)}>
      <span className="typo-body2 text-text-strong block truncate">{children}</span>
    </TableCell>
  );
}

function MemberNumberCell({ children }: { children: ReactNode }) {
  return (
    <TableCell className="h-16 w-12 p-0 px-100 py-300 text-center">
      <span className="typo-body2 text-text-strong">{children}</span>
    </TableCell>
  );
}

export { MemberTableRow };
