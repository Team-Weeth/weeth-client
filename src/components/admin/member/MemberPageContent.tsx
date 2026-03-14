'use client';

import React from 'react';

import {
  AddGenerationButton,
  AddGenerationModal,
  GenerationCard,
  MemberSearchBar,
  MemberTable,
  MemberTopBar,
} from '@/components/admin';
import { MOCK_MEMBERS } from '@/components/admin/member/MemberTable';

function MemberPageContent() {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [searchValue, setSearchValue] = React.useState('');

  const selectedMembers = MOCK_MEMBERS.filter((m) => selectedIds.has(m.id));
  const selectedCount = selectedMembers.length;

  const allUsers = selectedCount > 0 && selectedMembers.every((m) => m.position === '사용자');
  const allAdmins = selectedCount > 0 && selectedMembers.every((m) => m.position === '관리자');

  const handleClearSelection = () => setSelectedIds(new Set());

  return (
    <div className="flex min-w-0 flex-col">
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
          <MemberSearchBar isWrapped={false} value={searchValue} onValueChange={setSearchValue} />
        </div>

        {/* Generation cards */}
        <div
          className="scrollbar-none flex cursor-grab gap-400 overflow-x-auto select-none active:cursor-grabbing"
          onMouseDown={(e) => {
            const el = e.currentTarget;
            const startX = e.pageX - el.offsetLeft;
            const scrollLeft = el.scrollLeft;
            const onMouseMove = (ev: MouseEvent) => {
              el.scrollLeft = scrollLeft - (ev.pageX - el.offsetLeft - startX);
            };
            const onMouseUp = () => {
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('mouseup', onMouseUp);
            };
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
          }}
        >
          <AddGenerationModal>
            <AddGenerationButton />
          </AddGenerationModal>
          <GenerationCard variant="active" title="전체" description="총 100명" />

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
        <div className="bg-container-neutral min-w-0 overflow-hidden rounded-lg px-600 pt-600 pb-[64px] shadow-[0px_1px_5px_0px_rgba(17,33,49,0.15)]">
          <MemberTable selectedIds={selectedIds} onSelectionChange={setSelectedIds} />
        </div>
      </div>
    </div>
  );
}

export { MemberPageContent };
