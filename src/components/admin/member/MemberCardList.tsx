import { AdminFilterIcon } from '@/assets/icons/admin';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { Member } from '@/types/admin/member';
import type { MemberSortBy } from '@/utils/admin/memberPageUtils';
import { MemberCard } from './MemberCard';
import { MemberPagination } from './MemberPagination';
import { MemberSelectionCheckbox } from './MemberSelectionCheckbox';

interface MemberCardListProps extends React.HTMLAttributes<HTMLDivElement> {
  members: Member[];
  page: number;
  totalPages: number;
  sortBy: MemberSortBy;
  selectedIds: Set<string>;
  onPageChange: (page: number) => void;
  onToggleSort: () => void;
  onSelectionChange: (ids: Set<string>) => void;
  onMemberAction?: (member: Member) => void;
}

function MemberCardList({
  className,
  members,
  page,
  totalPages,
  sortBy,
  selectedIds,
  onPageChange,
  onToggleSort,
  onSelectionChange,
  onMemberAction,
  ...props
}: MemberCardListProps) {
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const isAllSelected = members.length > 0 && members.every((member) => selectedIds.has(member.id));
  const hasAnySelected = members.some((member) => selectedIds.has(member.id));
  const isPartiallySelected = hasAnySelected && !isAllSelected;

  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (isAllSelected) {
      members.forEach((member) => next.delete(member.id));
    } else {
      members.forEach((member) => next.add(member.id));
    }
    onSelectionChange(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  };

  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <div className="mb-300 flex items-center justify-between">
        <div className="typo-body1 text-text-alternative flex cursor-pointer items-center gap-100">
          <MemberSelectionCheckbox
            checked={isAllSelected}
            partial={isPartiallySelected}
            ariaLabel="현재 페이지 멤버 전체 선택"
            checkedLabel="현재 페이지 전체 선택됨"
            uncheckedLabel="현재 페이지 전체 선택 안됨"
            onClick={(event) => {
              event.stopPropagation();
              toggleAll();
            }}
          />
          전체 선택
        </div>

        <button
          type="button"
          onClick={onToggleSort}
          className="text-text-alternative typo-button2 flex cursor-pointer items-center justify-center gap-100 rounded-sm bg-neutral-200 px-300 py-200"
          aria-label={`${sortBy === 'cardinal' ? '이름' : '기수'} 순으로 정렬`}
        >
          <Icon src={AdminFilterIcon} size={16} className="text-icon-alternative" />
          {sortBy === 'cardinal' ? '기수 순' : '이름 순'}
        </button>
      </div>

      <div className="flex flex-col gap-400">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            selected={selectedIds.has(member.id)}
            onToggleSelection={toggleOne}
            onMemberAction={onMemberAction}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <MemberPagination page={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
}

export { MemberCardList, type MemberCardListProps };
