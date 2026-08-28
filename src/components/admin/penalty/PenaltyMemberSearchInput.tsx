'use client';

import { CloseCircleIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { PenaltyMember } from '@/types/admin/penalty';

interface PenaltyMemberSearchInputProps {
  selectedMembers: PenaltyMember[];
  query: string;
  onQueryChange: (query: string) => void;
  onRemoveMember: (id: string) => void;
  className?: string;
}

function PenaltyMemberSearchInput({
  selectedMembers,
  query,
  onQueryChange,
  onRemoveMember,
  className,
}: PenaltyMemberSearchInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Backspace' || query.length > 0 || selectedMembers.length === 0) return;

    onRemoveMember(selectedMembers[selectedMembers.length - 1].id);
  };

  return (
    <label
      className={cn(
        'bg-container-neutral border-line focus-within:border-brand-primary',
        'scrollbar-none flex h-12 w-full min-w-0 cursor-text items-center gap-200',
        'overflow-x-auto rounded-sm border px-300 transition-colors',
        className,
      )}
    >
      {selectedMembers.map((member) => (
        <span
          key={member.id}
          className="bg-container-neutral-alternative typo-body2 text-text-normal flex shrink-0 items-center gap-100 rounded-sm py-100 pr-100 pl-200"
        >
          {member.name}
          <button
            type="button"
            aria-label={`${member.name} 선택 해제`}
            onClick={() => onRemoveMember(member.id)}
            className="text-icon-alternative hover:text-icon-normal flex cursor-pointer items-center transition-colors"
          >
            <Icon src={CloseCircleIcon} size={16} />
          </button>
        </span>
      ))}

      <input
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={selectedMembers.length > 0 ? '' : '이름을 작성하거나 리스트에서 선택하세요'}
        aria-label="멤버 검색"
        className="typo-body1 text-text-normal placeholder:text-text-alternative min-w-24 flex-1 bg-transparent focus:outline-none"
      />
    </label>
  );
}

export { PenaltyMemberSearchInput, type PenaltyMemberSearchInputProps };
