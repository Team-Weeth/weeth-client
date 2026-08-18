import { AdminMeatballIcon } from '@/assets/icons/admin';
import {
  AdminCardinalsCell,
  AdminNumberCell,
  AdminProfileCell,
  AdminSelectionCheckbox,
  AdminTextCell,
} from '@/components/admin/table';
import { Icon, TableCell, TableRow } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { Member } from '@/types/admin/member';
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
        <AdminSelectionCheckbox
          checked={selected}
          ariaLabel={`${member.name} ${member.studentId} 선택`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(member.id);
          }}
        />
      </TableCell>

      {/* 자기소개가 없는 경우 '-' 표시. TODO : api 응답에 자기소개 추가되어야 함 */}
      <AdminProfileCell className="w-[172px]" name={member.name} description="-" />

      {textCells.slice(0, 3).map(({ id, value }) => (
        <AdminTextCell key={id} className={TEXT_CELL_CLASS_BY_ID[id]}>
          {value}
        </AdminTextCell>
      ))}

      {NUMBER_CELL_VALUES.map((key) => (
        <AdminNumberCell key={key}>{member[key]}</AdminNumberCell>
      ))}
      <TableCell className="h-16 w-12 p-0 px-100 py-300" aria-hidden />

      {textCells.slice(3).map(({ id, value }) => (
        <AdminTextCell key={id} className={TEXT_CELL_CLASS_BY_ID[id]}>
          {value}
        </AdminTextCell>
      ))}

      <AdminCardinalsCell cardinal={member.cardinal} />

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

export { MemberTableRow };
