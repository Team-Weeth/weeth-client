'use client';

import React from 'react';

import {
  AddGenerationButton,
  GenerationCard,
  MemberSearchBar,
  MemberTable,
  MemberTopBar,
} from '@/components/admin';
import { MOCK_MEMBERS } from '@/components/admin/member/MemberTable';

function MemberPageContent() {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    new Set(),
  );
  const [searchValue, setSearchValue] = React.useState('');

  const selectedMembers = MOCK_MEMBERS.filter((m) => selectedIds.has(m.id));
  const selectedCount = selectedMembers.length;

  const allUsers =
    selectedCount > 0 && selectedMembers.every((m) => m.position === '사용자');
  const allAdmins =
    selectedCount > 0 && selectedMembers.every((m) => m.position === '관리자');

  const handleClearSelection = () => setSelectedIds(new Set());

  return (
    <div className="flex flex-col">
      {/* Selection top bar */}
      <MemberTopBar
        className="sticky top-0 z-10 -mt-15"
        selectedCount={selectedCount}
        canChangeToAdmin={allUsers}
        canChangeToUser={allAdmins}
        onBack={handleClearSelection}
      />

      {/* Main content */}
      <div className="flex flex-col gap-400 p-700">
        {/* Search bar */}
        <div className="bg-container-neutral flex items-center rounded-lg px-600 py-400 shadow-[0px_1px_5px_0px_rgba(17,33,49,0.15)]">
          <MemberSearchBar
            isWrapped={false}
            value={searchValue}
            onValueChange={setSearchValue}
          />
        </div>

        {/* Generation cards */}
        <div className="flex gap-400 overflow-x-auto">
          <AddGenerationButton />
          <GenerationCard
            variant="active"
            title="전체"
            description="총 100명"
          />
          <GenerationCard
            variant="empty"
            title="5기"
            subtitle="정보를 입력해주세요"
            description="노정완 외 25명"
          />
          <GenerationCard
            variant="normal"
            title="4기"
            subtitle="24년 2학기 (현재)"
            description="노정완 외 25명"
          />
          <GenerationCard
            variant="normal"
            title="3기"
            subtitle="24년 1학기"
            description="김성민 외 25명"
          />
          <GenerationCard
            variant="normal"
            title="2기"
            subtitle="23년 2학기"
            description="김성민 외 25명"
          />
          <GenerationCard
            variant="normal"
            title="1기"
            subtitle="23년 1학기"
            description="김성민 외 25명"
          />
        </div>

        {/* Member table */}
        <div className="bg-container-neutral rounded-lg px-600 pb-[64px] pt-600 shadow-[0px_1px_5px_0px_rgba(17,33,49,0.15)]">
          <MemberTable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </div>
      </div>
    </div>
  );
}

export { MemberPageContent };
