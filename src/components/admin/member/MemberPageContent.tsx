'use client';

import { useState } from 'react';

import {
  AddGenerationButton,
  AddGenerationModal,
  GenerationCard,
  MemberDetailModal,
  MemberSearchBar,
  MemberTable,
  MemberTopBar,
} from '@/components/admin';
import { Card } from '@/components/ui';
import { useDragScroll } from '@/hooks';
import type { Member } from '@/types/admin/member';
import { useAdminMembers } from '@/hooks/queries/admin';
import { useChangeMemberRole } from '@/hooks/mutations/admin';

function MemberPageContent() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchValue, setSearchValue] = useState('');
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const { ref: dragScrollRef, onMouseDown } = useDragScroll();
  const { data: members = [] } = useAdminMembers();
  const { mutate: changeMemberRole } = useChangeMemberRole();

  const handleMemberAction = (m: Member) => {
    setDetailMember(m);
  };

  const query = searchValue.trim().toLowerCase();
  const filteredMembers = query
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.department.toLowerCase().includes(query) ||
          m.studentId.includes(query),
      )
    : members;

  const selectedMembers = filteredMembers.filter((m) => selectedIds.has(m.id));
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
          ref={dragScrollRef}
          className="scrollbar-none flex cursor-grab gap-400 overflow-x-auto select-none active:cursor-grabbing"
          onMouseDown={onMouseDown}
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
            members={filteredMembers}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onMemberAction={handleMemberAction}
          />
        </Card>
      </div>

      {/* Member detail modal */}
      <MemberDetailModal
        open={detailMember !== null}
        onOpenChange={(open) => {
          if (!open) setDetailMember(null);
        }}
        member={detailMember}
        onChangeToAdmin={
          detailMember
            ? () =>
                changeMemberRole({
                  clubMemberId: detailMember.clubMemberId,
                  memberRole: detailMember.memberRole === 'ADMIN' ? 'USER' : 'ADMIN',
                })
            : undefined
        }
      />
    </div>
  );
}

export { MemberPageContent };
