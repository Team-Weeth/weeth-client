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
import { useCardinals } from '@/hooks/queries';
import { useBanMember, useChangeMemberRole, useCreateCardinal, useRestoreMember } from '@/hooks/mutations/admin';

function MemberPageContent() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchValue, setSearchValue] = useState('');
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const { ref: dragScrollRef, onMouseDown } = useDragScroll();
  const { data: members = [] } = useAdminMembers();
  const { data: cardinals = [] } = useCardinals();
  const { mutate: changeMemberRole } = useChangeMemberRole();
  const { mutate: banMember } = useBanMember();
  const { mutate: restoreMember } = useRestoreMember();
  const { mutate: createCardinal } = useCreateCardinal();

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

  const allUsers = selectedCount > 0 && selectedMembers.every((m) => m.memberRole === 'USER');
  const allAdmins = selectedCount > 0 && selectedMembers.every((m) => m.memberRole === 'ADMIN');
  const targetRole = allUsers ? 'ADMIN' : allAdmins ? 'USER' : null;
  const allBanned = selectedCount > 0 && selectedMembers.every((m) => m.status === 'BANNED');

  const handleClearSelection = () => setSelectedIds(new Set());

  return (
    <div className="flex min-w-3xl flex-col">
      {/* Selection top bar */}
      <MemberTopBar
        className="sticky top-0 z-10 -mt-15"
        selectedCount={selectedCount}
        targetRole={targetRole}
        allBanned={allBanned}
        onBack={handleClearSelection}
        onChangeRole={
          targetRole
            ? () =>
                selectedMembers.forEach((m) =>
                  changeMemberRole({ clubMemberId: m.clubMemberId, memberRole: targetRole }),
                )
            : undefined
        }
        onBan={() => selectedMembers.forEach((m) => banMember(m.clubMemberId))}
        onRestore={() => selectedMembers.forEach((m) => restoreMember(m.clubMemberId))}
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
          <AddGenerationModal
            onSubmit={({ generation, year, semester, isCurrent }) =>
              createCardinal({ cardinalNumber: generation, year, semester, inProgress: isCurrent })
            }
          >
            <AddGenerationButton />
          </AddGenerationModal>
          {/* <GenerationCard variant="normal" title="전체" /> */}
          {cardinals.map((c) => (
            <GenerationCard
              key={c.id}
              variant={c.status === 'IN_PROGRESS' ? 'active' : 'normal'}
              title={`${c.cardinalNumber}기`}
              subtitle={`${c.year}년 ${c.semester}학기${c.status === 'IN_PROGRESS' ? ' (현재)' : ''}`}
            />
          ))}
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
        onBan={detailMember ? () => banMember(detailMember.clubMemberId) : undefined}
        onRestore={
          detailMember
            ? () => {
                setDetailMember({ ...detailMember, status: 'ACTIVE' });
                restoreMember(detailMember.clubMemberId);
              }
            : undefined
        }
        onChangeRole={
          detailMember
            ? () => {
                const nextRole = detailMember.memberRole === 'ADMIN' ? 'USER' : 'ADMIN';
                const ROLE_LABEL = { USER: '사용자', ADMIN: '관리자', LEAD: '리더' } as const;
                setDetailMember({
                  ...detailMember,
                  memberRole: nextRole,
                  position: ROLE_LABEL[nextRole],
                });
                changeMemberRole({ clubMemberId: detailMember.clubMemberId, memberRole: nextRole });
              }
            : undefined
        }
      />
    </div>
  );
}

export { MemberPageContent };
