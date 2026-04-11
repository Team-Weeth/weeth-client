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
import {
  useBanMember,
  useChangeMemberCardinals,
  useChangeMemberRole,
  useCreateCardinal,
  useRestoreMember,
} from '@/hooks/mutations/admin';

function MemberPageContent() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchValue, setSearchValue] = useState('');
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const [selectedCardinal, setSelectedCardinal] = useState<number | 'all'>('all');
  const { ref: dragScrollRef, onMouseDown } = useDragScroll();
  const { data: members = [] } = useAdminMembers();
  const { data: cardinals = [] } = useCardinals();
  const { mutate: changeMemberRole } = useChangeMemberRole();
  const { mutate: banMember } = useBanMember();
  const { mutate: restoreMember } = useRestoreMember();
  const { mutate: createCardinal } = useCreateCardinal();
  const { mutate: changeMemberCardinals } = useChangeMemberCardinals();

  const handleMemberAction = (m: Member) => {
    setDetailMember(m);
  };

  const cardinalFilteredMembers =
    selectedCardinal === 'all'
      ? members
      : members.filter((m) =>
          m.generation
            .split(',')
            .map((g) => g.trim())
            .includes(String(selectedCardinal)),
        );

  const query = searchValue.trim().toLowerCase();
  const filteredMembers = query
    ? cardinalFilteredMembers.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.department.toLowerCase().includes(query) ||
          m.studentId.includes(query) ||
          m.generation.includes(query),
      )
    : cardinalFilteredMembers;

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
        onChangeCardinals={(cardinalIds) =>
          selectedMembers.forEach((m) =>
            changeMemberCardinals({ clubMemberId: m.clubMemberId, cardinalIds }),
          )
        }
      />

      {/* Main content */}
      <div className="flex flex-col gap-400 p-700">
        {/* Generation pills */}
        <div
          ref={dragScrollRef}
          className="scrollbar-none flex cursor-grab items-center gap-200 overflow-x-auto select-none active:cursor-grabbing"
          onMouseDown={onMouseDown}
        >
          <GenerationCard
            variant={selectedCardinal === 'all' ? 'active' : 'normal'}
            title="전체"
            onClick={() => setSelectedCardinal('all')}
          />
          {cardinals.map((c) => (
            <GenerationCard
              key={c.id}
              variant={selectedCardinal === c.cardinalNumber ? 'active' : 'normal'}
              title={`${c.cardinalNumber}기`}
              onClick={() => setSelectedCardinal(c.cardinalNumber)}
            />
          ))}
          <AddGenerationModal
            onSubmit={({ generation, isCurrent }) =>
              createCardinal({ cardinalNumber: generation, inProgress: isCurrent })
            }
          >
            <AddGenerationButton />
          </AddGenerationModal>
        </div>

        {/* Search bar */}
        <Card>
          <MemberSearchBar isWrapped={false} value={searchValue} onValueChange={setSearchValue} />
        </Card>

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
        onBan={
          detailMember
            ? () => {
                setDetailMember({ ...detailMember, status: 'BANNED' });
                banMember(detailMember.clubMemberId);
              }
            : undefined
        }
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
        onChangeCardinals={
          detailMember
            ? (cardinalIds) =>
                changeMemberCardinals({
                  clubMemberId: detailMember.clubMemberId,
                  cardinalIds,
                })
            : undefined
        }
      />
    </div>
  );
}

export { MemberPageContent };
