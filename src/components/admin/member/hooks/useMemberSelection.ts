import { useState } from 'react';

import type { Member } from '@/types/admin/member';
import { getMemberIds, getSelectedMemberCardinals } from '@/utils/admin/memberPageUtils';

function useMemberSelection(members: Member[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedMemberById, setSelectedMemberById] = useState<Map<string, Member>>(new Map());

  const selectedMembers = Array.from(selectedMemberById.values()).filter((member) =>
    selectedIds.has(member.id),
  );
  const selectedCount = selectedMembers.length;
  const selectedClubMemberIds = getMemberIds(selectedMembers);
  const selectedMemberCardinals = getSelectedMemberCardinals(selectedMembers);

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectedMemberById(new Map());
  };

  const handleSelectionChange = (nextIds: Set<string>) => {
    setSelectedIds(nextIds);
    setSelectedMemberById((prev) => {
      const next = new Map(prev);

      next.forEach((_, id) => {
        if (!nextIds.has(id)) next.delete(id);
      });

      members.forEach((member) => {
        if (nextIds.has(member.id)) {
          next.set(member.id, member);
        } else {
          next.delete(member.id);
        }
      });

      return next;
    });
  };

  return {
    selectedIds,
    selectedMemberById,
    selectedMembers,
    selectedCount,
    selectedClubMemberIds,
    selectedMemberCardinals,
    clearSelection,
    handleSelectionChange,
  };
}

export { useMemberSelection };
