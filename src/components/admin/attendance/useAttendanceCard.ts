'use client';

import { useState } from 'react';

import type { AttendanceMember } from '@/types/admin/attendance';

type CardState = 'collapsed' | 'expanded' | 'editing';

interface UseAttendanceCardParams {
  members: AttendanceMember[];
  onSave?: (updates: { id: number; status: 'ATTEND' | 'ABSENT' }[]) => void | Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
}

function useAttendanceCard({ members, onSave, onDirtyChange }: UseAttendanceCardParams) {
  const [cardState, setCardState] = useState<CardState>('collapsed');
  const [searchQuery, setSearchQuery] = useState('');
  const [editStatuses, setEditStatuses] = useState<Map<number, 'ATTEND' | 'ABSENT'>>(new Map());

  const baseStatuses = new Map<number, 'ATTEND' | 'ABSENT'>();
  members.forEach((m) => {
    if (m.status !== 'PENDING') baseStatuses.set(m.id, m.status);
  });

  const filteredMembers = members.filter(
    (m) =>
      m.name?.includes(searchQuery) ||
      m.studentId?.includes(searchQuery) ||
      m.department?.includes(searchQuery),
  );

  const isEditing = cardState === 'editing';
  const isCollapsed = cardState === 'collapsed';

  const expand = () => {
    setEditStatuses(new Map());
    onDirtyChange?.(false);
    setCardState('expanded');
  };

  const collapse = () => {
    setEditStatuses(new Map());
    onDirtyChange?.(false);
    setCardState('collapsed');
  };

  const startEdit = () => {
    setEditStatuses(new Map());
    onDirtyChange?.(false);
    setCardState('editing');
  };

  const cancelEdit = () => {
    setEditStatuses(new Map());
    onDirtyChange?.(false);
    setCardState('expanded');
  };

  const saveEdit = async () => {
    const updates = Array.from(editStatuses.entries()).map(([id, status]) => ({ id, status }));

    if (updates.length === 0) {
      setCardState('expanded');
      return;
    }

    try {
      await onSave?.(updates);
      setEditStatuses(new Map());
      onDirtyChange?.(false);
      setCardState('expanded');
    } catch {
      // error toast is handled by the mutation's onError
    }
  };

  const toggleStatus = (memberId: number, status: 'ATTEND' | 'ABSENT') => {
    const next = new Map(editStatuses);
    const base = baseStatuses.get(memberId);

    if (base === status) next.delete(memberId);
    else next.set(memberId, status); // 변경된 것만 저장

    setEditStatuses(next);
    onDirtyChange?.(next.size > 0);
  };

  const getEditStatus = (memberId: number) =>
    editStatuses.get(memberId) ?? baseStatuses.get(memberId);

  const isDirty = editStatuses.size > 0;

  return {
    isCollapsed,
    isEditing,
    isDirty,
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
