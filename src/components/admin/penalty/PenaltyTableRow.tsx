import {
  AdminCardinalsCell,
  AdminNumberCell,
  AdminProfileCell,
  AdminSelectionCheckbox,
  AdminTextCell,
} from '@/components/admin/table';
import { TableCell, TableRow } from '@/components/ui';
import { PENALTY_COLUMN_WIDTH } from '@/constants/admin/penaltyTable.constants';
import { cn } from '@/lib/cn';
import type { PenaltyMember } from '@/types/admin/penalty';
import { formatPenaltyDate, truncateIntroduction } from '@/utils/admin/penaltyPageUtils';

interface PenaltyTableRowProps {
  member: PenaltyMember;
  selected: boolean;
  onToggle: (id: string) => void;
}

function PenaltyTableRow({ member, selected, onToggle }: PenaltyTableRowProps) {
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
        <AdminSelectionCheckbox
          checked={selected}
          ariaLabel={`${member.name} 선택`}
          onClick={() => onToggle(member.id)}
        />
      </TableCell>

      <AdminProfileCell
        className={PENALTY_COLUMN_WIDTH.profile}
        name={member.name}
        description={truncateIntroduction(member.introduction)}
      />

      <AdminTextCell className={PENALTY_COLUMN_WIDTH.role}>{member.position}</AdminTextCell>
      <AdminTextCell className={PENALTY_COLUMN_WIDTH.department}>{member.department}</AdminTextCell>

      <AdminNumberCell className={PENALTY_COLUMN_WIDTH.penalty}>
        {member.penaltyCount}
      </AdminNumberCell>

      <AdminTextCell className={PENALTY_COLUMN_WIDTH.recentPenalty}>
        {formatPenaltyDate(member.recentPenaltyAt)}
      </AdminTextCell>

      <AdminCardinalsCell className={PENALTY_COLUMN_WIDTH.cardinal} cardinal={member.cardinal} />
    </TableRow>
  );
}

export { PenaltyTableRow, type PenaltyTableRowProps };
