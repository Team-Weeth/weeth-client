import type { ReactNode } from 'react';

import AdminMeatballIcon from '@/assets/icons/admin/ic_admin_meatball.svg';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/Icon';
import { TableCell, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
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
  showStickyShadow?: boolean;
}

const TEXT_CELL_CLASS_BY_ID = {
  role: 'w-[118px] max-tablet:w-[88px]',
  department: 'w-[190px] max-tablet:w-[180px]',
  studentId: 'w-[138px] max-tablet:w-[120px]',
  phone: 'w-[146px] max-tablet:w-[132px]',
} as const;

const NUMBER_CELL_VALUES = ['attendance', 'absence', 'penaltyCount'] as const;

function MemberTableRow({
  member,
  selected,
  onToggle,
  onMemberAction,
  showStickyShadow = false,
}: MemberTableRowProps) {
  const textCells = [
    { id: 'role', value: member.position },
    { id: 'department', value: member.department },
    { id: 'studentId', value: member.studentId },
    { id: 'phone', value: member.phone },
  ] as const;

  return (
    <TableRow
      className={cn(
        'bg-container-neutral [&>td]:border-line max-tablet:h-12 max-tablet:[&>td]:border-b-0 [&>td]:bg-container-neutral h-16 cursor-pointer border-0 [&:last-child>td]:border-b-0 [&>td]:border-b hover:[&>td]:bg-neutral-200',
        selected &&
          'bg-container-primary-alternative [&>td]:bg-container-primary-alternative hover:[&>td]:bg-container-primary-alternative',
      )}
      onClick={() => onMemberAction?.(member)}
    >
      <TableCell
        className={cn(
          'h-16 w-16 min-w-16 p-0 pl-300',
          'max-tablet:sticky max-tablet:left-0 max-tablet:z-20 max-tablet:h-12 max-tablet:w-12 max-tablet:min-w-12 max-tablet:bg-inherit max-tablet:pl-200',
        )}
      >
        <MemberSelectionCheckbox
          checked={selected}
          ariaLabel={`${member.name} ${member.studentId} 선택`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(member.id);
          }}
        />
      </TableCell>

      <MemberProfileCell member={member} showStickyShadow={showStickyShadow} />

      {textCells.slice(0, 3).map(({ id, value }) => (
        <MemberTextCell key={id} className={TEXT_CELL_CLASS_BY_ID[id]}>
          {value}
        </MemberTextCell>
      ))}

      {NUMBER_CELL_VALUES.map((key) => (
        <MemberNumberCell key={key}>{member[key]}</MemberNumberCell>
      ))}
      <TableCell
        className="max-tablet:h-12 max-tablet:py-100 h-16 w-12 p-0 px-100 py-300"
        aria-hidden
      />

      {textCells.slice(3).map(({ id, value }) => (
        <MemberTextCell key={id} className={TEXT_CELL_CLASS_BY_ID[id]}>
          {value}
        </MemberTextCell>
      ))}

      <MemberCardinalsCell cardinal={member.cardinal} />

      <TableCell className="max-tablet:h-12 max-tablet:px-300 max-tablet:py-100 h-16 w-[76px] p-0 px-400 py-[7px]">
        <MemberStatusBadge status={member.status} />
      </TableCell>

      <TableCell className="max-tablet:h-12 max-tablet:pr-300 h-16 w-11 p-0 pr-700">
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

function MemberProfileCell({
  member,
  showStickyShadow,
}: {
  member: Member;
  showStickyShadow: boolean;
}) {
  return (
    <TableCell
      className={cn(
        'h-16 w-[220px] min-w-[220px] p-0 pr-400',
        'max-tablet:sticky max-tablet:left-12 max-tablet:z-20 max-tablet:h-12 max-tablet:w-[132px] max-tablet:min-w-[132px] max-tablet:bg-inherit max-tablet:pr-200',
        showStickyShadow &&
          'max-tablet:after:absolute max-tablet:after:top-0 max-tablet:after:right-[-24px] max-tablet:after:h-full max-tablet:after:w-6 max-tablet:after:bg-[image:var(--member-table-sticky-shadow)] max-tablet:after:content-[""]',
      )}
    >
      <div className="max-tablet:gap-200 flex w-full min-w-0 items-center gap-300 overflow-hidden">
        <Avatar size={40} className="max-tablet:size-7">
          {member.profileImageUrl && (
            <AvatarImage src={member.profileImageUrl} alt={`${member.name} 프로필 이미지`} />
          )}
          <AvatarFallback />
        </Avatar>
        <div className="max-tablet:w-[88px] max-tablet:max-w-[88px] flex w-[152px] max-w-[152px] min-w-0 flex-col justify-center gap-0.5 overflow-hidden">
          <span className="typo-button2 text-text-normal truncate">{member.name}</span>
          <span
            className={cn(
              'typo-caption2 max-tablet:hidden truncate',
              member.bio ? 'text-text-alternative' : 'text-text-disabled',
            )}
          >
            {member.bio ?? '-'}
          </span>
        </div>
      </div>
    </TableCell>
  );
}

function MemberCardinalsCell({ cardinal }: { cardinal: string }) {
  const { visibleCardinals, hiddenCardinals, hiddenCardinalCount } =
    getVisibleMemberCardinals(cardinal);
  const hiddenCardinalLabel = hiddenCardinals.map(formatCardinalLabel).join(', ');

  return (
    <TableCell className="max-tablet:h-12 max-tablet:px-300 max-tablet:py-100 h-16 w-[182px] p-0 px-400 py-[7px]">
      <div className="flex items-center gap-100 overflow-visible">
        {visibleCardinals.map((item) => (
          <CardinalTag key={item}>{formatCardinalLabel(item)}</CardinalTag>
        ))}
        {hiddenCardinalCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="cursor-default"
                aria-label={`숨겨진 활동기수 ${hiddenCardinalLabel}`}
                onClick={(event) => event.stopPropagation()}
              >
                <CardinalTag>+{hiddenCardinalCount}</CardinalTag>
              </button>
            </TooltipTrigger>
            <TooltipContent variant="dark" side="top" align="center" sideOffset={6}>
              {hiddenCardinalLabel}
            </TooltipContent>
          </Tooltip>
        )}
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
    <TableCell
      className={cn(
        'max-tablet:h-12 max-tablet:px-300 max-tablet:py-100 h-16 p-0 px-400 py-300',
        className,
      )}
    >
      <span className="typo-body2 text-text-strong block truncate">{children}</span>
    </TableCell>
  );
}

function MemberNumberCell({ children }: { children: ReactNode }) {
  return (
    <TableCell className="max-tablet:h-12 max-tablet:py-100 h-16 w-12 p-0 px-100 py-300 text-center">
      <span className="typo-body2 text-text-strong">{children}</span>
    </TableCell>
  );
}

export { MemberTableRow };
