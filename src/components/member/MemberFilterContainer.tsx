'use client';

import { MEMBER_ROLE_FILTER_OPTIONS } from '@/constants/member';
import type { MemberRoleFilterValue } from '@/constants/member';
import type { ClubMemberPosition } from '@/types/member';
import { MemberFilterDropdown } from './MemberFilterDropdown';
import ResetIcon from '@/assets/icons/reset.svg';
import { Icon } from '@/components/ui/Icon';
import { MemberSearchBar } from './MemberSearchBar';

interface MemberFilterContainerProps {
  positionOptions: ClubMemberPosition[];
  selectedPositionIds: string[];
  selectedRoles: MemberRoleFilterValue[];
  onApplyPositionIds: (values: string[]) => void;
  onApplyRoles: (values: MemberRoleFilterValue[]) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

function MemberFilterContainer({
  positionOptions,
  selectedPositionIds,
  selectedRoles,
  onApplyPositionIds,
  onApplyRoles,
  searchQuery,
  onSearchQueryChange,
}: MemberFilterContainerProps) {
  const hasActiveFilters = selectedPositionIds.length > 0 || selectedRoles.length > 0;

  const handleResetAll = () => {
    onApplyPositionIds([]);
    onApplyRoles([]);
  };

  const positionFilterOptions = positionOptions
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((option) => ({ value: String(option.id), label: option.name }));

  return (
    <div className="tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-0 flex flex-col-reverse gap-300 pt-500 pb-400">
      <div className="flex items-center gap-2">
        <MemberFilterDropdown
          label="포지션"
          options={positionFilterOptions}
          selected={selectedPositionIds}
          onApply={onApplyPositionIds}
        />
        <MemberFilterDropdown
          label="역할"
          options={MEMBER_ROLE_FILTER_OPTIONS}
          selected={selectedRoles}
          onApply={onApplyRoles}
        />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetAll}
            className="typo-body2 text-text-alternative flex cursor-pointer items-center gap-100"
          >
            <Icon src={ResetIcon} size={24} />
            초기화
          </button>
        )}
      </div>
      <div className="tablet:w-auto w-full">
        <MemberSearchBar value={searchQuery} onValueChange={onSearchQueryChange} />
      </div>
    </div>
  );
}

export { MemberFilterContainer, type MemberFilterContainerProps };
