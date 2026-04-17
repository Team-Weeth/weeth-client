import { useState } from 'react';

import type { AttendanceMember } from '@/types/admin/attendance';
import { toastError } from '@/stores/useToastStore';

type CardState = 'collapsed' | 'expanded' | 'editing';

interface UseAttendanceCardParams {
  members: AttendanceMember[];
  onSave?: (updates: { id: number; status: 'ATTEND' | 'ABSENT' }[]) => void | Promise<void>;
}

function useAttendanceCard({ members, onSave }: UseAttendanceCardParams) {
  const [cardState, setCardState] = useState<CardState>('collapsed');
  const [searchQuery, setSearchQuery] = useState('');
  const [editStatuses, setEditStatuses] = useState<Map<number, 'ATTEND' | 'ABSENT'>>(new Map());

  const baseStatuses = new Map<number, 'ATTEND' | 'ABSENT'>();
  members.forEach((m) => {
    if (m.status !== 'PENDING') baseStatuses.set(m.id, m.status);
  });

  const filteredMembers = members.filter(
    (m) =>
      m.name.includes(searchQuery) ||
      m.studentId.includes(searchQuery) ||
      m.department.includes(searchQuery),
  );

  const isEditing = cardState === 'editing';
  const isCollapsed = cardState === 'collapsed';

  const expand = () => {
    setEditStatuses(new Map());
    setCardState('expanded');
  };

  const collapse = () => {
    setEditStatuses(new Map());
    setCardState('collapsed');
  };

  const startEdit = () => {
    setEditStatuses(new Map());
    setCardState('editing');
  };

  const cancelEdit = () => {
    setEditStatuses(new Map());
    setCardState('expanded');
  };

  const saveEdit = async () => {
    const updates = Array.from(editStatuses.entries()).map(([id, status]) => ({ id, status }));
    try {
      await onSave?.(updates);
      setEditStatuses(new Map());
      setCardState('expanded');
    } catch {
      toastError('출석 상태 수정에 실패했습니다.');
    }
  };

  const toggleStatus = (memberId: number, status: 'ATTEND' | 'ABSENT') => {
    setEditStatuses((prev) => {
      const next = new Map(prev);
      const base = baseStatuses.get(memberId);

      if (base === status) next.delete(memberId);
      else next.set(memberId, status); // 변경된 것만 저장

      return next;
    });
  };

  const getEditStatus = (memberId: number) =>
    editStatuses.get(memberId) ?? baseStatuses.get(memberId);

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
