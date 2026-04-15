import { useState } from 'react';

import type { AttendanceMember } from '@/types/admin/attendance';

type CardState = 'collapsed' | 'expanded' | 'editing';

interface UseAttendanceCardParams {
  members: AttendanceMember[];
  onSave?: (updates: { id: number; status: 'ATTEND' | 'ABSENT' }[]) => void;
}

function useAttendanceCard({ members, onSave }: UseAttendanceCardParams) {
  const [cardState, setCardState] = useState<CardState>('collapsed');
  const [searchQuery, setSearchQuery] = useState('');
  const [editStatuses, setEditStatuses] = useState<Map<number, 'ATTEND' | 'ABSENT'>>(new Map());

  const filteredMembers = members.filter(
    (m) =>
      m.name.includes(searchQuery) ||
      m.studentId.includes(searchQuery) ||
      m.department.includes(searchQuery),
  );

  const isEditing = cardState === 'editing';
  const isCollapsed = cardState === 'collapsed';

  const expand = () => setCardState('expanded');
  const collapse = () => setCardState('collapsed');

  const startEdit = () => {
    const initial = new Map<number, 'ATTEND' | 'ABSENT'>();
    members.forEach((m) => {
      if (m.status !== 'PENDING') {
        initial.set(m.id, m.status);
      }
    });
    setEditStatuses(initial);
    setCardState('editing');
  };

  const cancelEdit = () => {
    setEditStatuses(new Map());
    setCardState('expanded');
  };

  const saveEdit = () => {
    const updates = Array.from(editStatuses.entries()).map(([id, status]) => ({ id, status }));
    onSave?.(updates);
    setCardState('expanded');
  };

  const toggleStatus = (memberId: number, status: 'ATTEND' | 'ABSENT') => {
    setEditStatuses((prev) => {
      const next = new Map(prev);
      if (next.get(memberId) === status) {
        next.delete(memberId);
      } else {
        next.set(memberId, status);
      }
      return next;
    });
  };

  const getEditStatus = (memberId: number) => editStatuses.get(memberId);

  return {
    isCollapsed,
    isEditing,
    searchQuery,
    setSearchQuery,
    filteredMembers,
    expand,
    collapse,
    startEdit,
    cancelEdit,
    saveEdit,
    toggleStatus,
    getEditStatus,
  };
}

export { useAttendanceCard, type CardState };
