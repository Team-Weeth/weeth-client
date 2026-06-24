import {
  Avatar,
  AvatarFallback,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import type { MockPaymentTarget } from '@/constants/mock';

const ROLE_LABEL: Record<string, string> = {
  LEAD: '리더',
  ADMIN: '관리자',
  USER: '일반멤버',
};

function SelectionStatusBadge({ isSelected }: { isSelected: boolean }) {
  if (isSelected) {
    return (
      <span className="tag-base bg-state-success/10 text-state-success">선택됨</span>
    );
  }
  return <span className="tag-base text-text-alternative">제외됨</span>;
}

interface DuesMemberTableProps {
  pagedTargets: MockPaymentTarget[];
  selectedSet: Set<number>;
  toggleMember: (id: number) => void;
}

function DuesMemberTable({ pagedTargets, selectedSet, toggleMember }: DuesMemberTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-container-neutral-alternative">
          <TableHead className="typo-caption1 text-text-alternative w-16 text-center">
            선택
          </TableHead>
          <TableHead className="typo-caption1 text-text-alternative">이름</TableHead>
          <TableHead className="typo-caption1 text-text-alternative">학과</TableHead>
          <TableHead className="typo-caption1 text-text-alternative">직급</TableHead>
          <TableHead className="typo-caption1 text-text-alternative text-right">
            납부 현황
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
              className="cursor-pointer"
              onClick={() => toggleMember(clubMemberId)}
            >
              <TableCell className="text-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleMember(clubMemberId)}
                  onClick={(e) => e.stopPropagation()}
                  className="accent-brand-primary size-4 cursor-pointer"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-300">
                  <Avatar size={40}>
                    <AvatarFallback>{name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="typo-body2 text-text-normal">{name}</span>
                </div>
              </TableCell>
              <TableCell className="typo-body2 text-text-normal">{department}</TableCell>
              <TableCell className="typo-body2 text-text-normal">
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
            <TableCell colSpan={5} className="typo-body2 text-text-alternative py-700 text-center">
              멤버가 없습니다
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export { DuesMemberTable };
