'use client';

import React from 'react';

import {
  AddGenerationButton,
  AddGenerationModal,
  GenerationCard,
  MemberDetailModal,
  MemberSearchBar,
  MemberTable,
  MemberTopBar,
} from '@/components/admin';
import { MOCK_MEMBERS, type Member } from '@/components/admin/member/MemberTable';
import type { MemberDetail } from '@/components/admin/member/MemberDetailModal';
import { Card } from '@/components/ui';

function MemberPageContent() {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [searchValue, setSearchValue] = React.useState('');
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [detailMember, setDetailMember] = React.useState<MemberDetail | null>(null);

  const toMemberDetail = (m: Member): MemberDetail => ({
    name: m.name,
    generation: parseInt(m.cardinal.split('.')[0], 10),
    status: m.status,
    position: m.position,
    role: m.role,
    department: m.department,
    phone: m.phone,
    studentId: m.studentId,
    email: 'weeth123@gmail.com',
    activeGenerations: m.cardinal,
    memberStatus: '알럼나이',
    joinDate: '2024.12.03.',
    attendance: m.attendance,
    absence: m.absence,
    penalty: 0,
  });

  const handleMemberAction = (m: Member) => {
    setDetailMember(toMemberDetail(m));
    setDetailModalOpen(true);
  };

  const selectedMembers = MOCK_MEMBERS.filter((m) => selectedIds.has(m.id));
  const selectedCount = selectedMembers.length;

  const allUsers = selectedCount > 0 && selectedMembers.every((m) => m.position === '사용자');
  const allAdmins = selectedCount > 0 && selectedMembers.every((m) => m.position === '관리자');

  const handleClearSelection = () => setSelectedIds(new Set());

  return (
    <div className="flex min-w-3xl flex-col">
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
        <Card>
          <MemberSearchBar isWrapped={false} value={searchValue} onValueChange={setSearchValue} />
        </Card>

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
          {/* TODO: api 연결시 하드 코딩 제거 */}
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
        <Card>
          <MemberTable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onMemberAction={handleMemberAction}
          />
        </Card>
      </div>

      {/* Member detail modal */}
      <MemberDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        member={detailMember}
      />
    </div>
  );
}

export { MemberPageContent };
