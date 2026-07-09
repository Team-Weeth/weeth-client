import {
  Avatar,
  AvatarFallback,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Checkbox,
} from '@/components/ui';

import type { PaymentTarget } from '@/types/admin/dues';

const ROLE_LABEL: Record<string, string> = {
  LEAD: '리더',
  ADMIN: '관리자',
  USER: '일반멤버',
};

function SelectionStatusBadge({ isSelected }: { isSelected: boolean }) {
  if (isSelected) {
    return <span className="tag-base bg-state-success/10 text-state-success">선택됨</span>;
  }
  return <span className="tag-base bg-text-alternative/10 text-text-alternative">제외됨</span>;
}

interface DuesMemberTableProps {
  pagedTargets: PaymentTarget[];
  selectedSet: Set<number>;
  toggleMember?: (id: number) => void;
  readOnly?: boolean;
}

function DuesMemberTable({
  pagedTargets,
  selectedSet,
  toggleMember,
  readOnly = false,
}: DuesMemberTableProps) {
  return (
    <Table
      wrapperClassName="rounded-sm border"
      className="border-separate border-spacing-0 [&_tbody_td]:border-b [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:last-child_td:first-child]:rounded-bl-sm [&_tbody_tr:last-child_td:last-child]:rounded-br-sm [&_thead_tr_th]:rounded-none [&_thead_tr_th]:border-b [&_thead_tr_th:first-child]:rounded-tl-sm [&_thead_tr_th:last-child]:rounded-tr-sm"
    >
      <TableHeader>
        <TableRow className="bg-container-neutral-alternative">
          {!readOnly && (
            <TableHead className="typo-caption1 text-text-alternative w-16 text-center">
              선택
            </TableHead>
          )}

          <TableHead className="typo-caption1 text-text-alternative pl-[75px]">이름</TableHead>

          <TableHead className="typo-caption1 text-text-alternative tablet:table-cell hidden">
            학과
          </TableHead>
          <TableHead className="typo-caption1 text-text-alternative">직급</TableHead>
          <TableHead className="typo-caption1 text-text-alternative text-right">
            납부 대상
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pagedTargets.map(({ targetId, paymentTargetInfo }) => {
          const { clubMemberId, name, department, memberRole } = paymentTargetInfo;
          const isSelected = selectedSet.has(clubMemberId);
          return (
            <TableRow
              key={targetId}
              className={readOnly ? undefined : 'cursor-pointer'}
              onClick={readOnly ? undefined : () => toggleMember?.(clubMemberId)}
            >
              {!readOnly && (
                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    color="primary"
                    id={`select-member-${clubMemberId}`}
                    name={`select-member-${clubMemberId}`}
                    checked={isSelected}
                    onCheckedChange={() => toggleMember?.(clubMemberId)}
                  />
                </TableCell>
              )}
              <TableCell>
                <div className="flex items-center gap-300">
                  <Avatar size={40}>
                    <AvatarFallback>{name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="typo-body1 text-text-normal">{name}</span>
                </div>
              </TableCell>
              <TableCell className="typo-body1 text-text-normal tablet:table-cell hidden">
                {department}
              </TableCell>
              <TableCell className="typo-body1 text-text-normal">
                {ROLE_LABEL[memberRole] ?? memberRole}
              </TableCell>
              <TableCell className="text-right">
                <SelectionStatusBadge isSelected={isSelected} />
              </TableCell>
            </TableRow>
          );
        })}
        {pagedTargets.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={readOnly ? 4 : 5}
              className="typo-body2 text-text-alternative py-700 text-center"
            >
              멤버가 없습니다
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export { DuesMemberTable };
