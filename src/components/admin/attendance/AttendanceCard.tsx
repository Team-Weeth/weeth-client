'use client';

import { useState } from 'react';

import { ArrowDownIcon, SearchIcon } from '@/assets/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  Button,
  Icon,
  Badge,
  Skeleton,
} from '@/components/ui';
import type { AttendanceMember } from '@/types/admin/attendance';
import { cn } from '@/lib/cn';

import { useAttendanceCard } from './useAttendanceCard';
import { AttendanceMemberRow } from './AttendanceMemberRow';
import { AttendanceTableRow } from './AttendanceTableRow';

interface AttendanceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  date: string;
  title: string;
  isCurrentWeek?: boolean;
  members: AttendanceMember[];
  onSave?: (updates: { id: number; status: 'ATTEND' | 'ABSENT' }[]) => void | Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
  onExpand?: () => void;
  isSaving?: boolean;
  isMembersLoading?: boolean;
  defaultExpanded?: boolean;
}

function AttendanceCard({
  className,
  date,
  title,
  isCurrentWeek,
  members,
  onSave,
  onDirtyChange,
  onExpand,
  isSaving = false,
  isMembersLoading = false,
  defaultExpanded = false,
  ...props
}: AttendanceCardProps) {
  const {
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
  } = useAttendanceCard({ members, onSave, onDirtyChange, defaultExpanded });

  const handleExpand = () => {
    onExpand?.();
    expand();
  };

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleCancel = () => {
    if (isDirty) {
      setCancelDialogOpen(true);
    } else {
      cancelEdit();
    }
  };

  if (isCollapsed) {
    return (
      <div className={cn('overflow-hidden rounded-md', className)} {...props}>
        <button
          type="button"
          className="border-line tablet:h-[72px] tablet:px-600 tablet:py-0 flex min-h-[72px] w-full cursor-pointer items-center justify-between gap-300 rounded-md border px-400 py-300"
          onClick={handleExpand}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-300 gap-y-100 text-left">
            <span className="typo-sub1 text-text-normal shrink-0">{date}</span>
            <span className="typo-sub1 text-text-normal min-w-0 break-all">{title}</span>
            {isCurrentWeek && <Badge>이번 주</Badge>}
          </div>
          <Icon src={ArrowDownIcon} size={24} className="text-icon-normal shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('bg-background overflow-hidden rounded-md', className)} {...props}>
      {/* Green header */}
      <button
        type="button"
        className="bg-container-primary tablet:h-[72px] tablet:px-600 tablet:py-0 flex min-h-[72px] w-full cursor-pointer items-center justify-between gap-300 px-400 py-300"
        onClick={collapse}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-300 gap-y-100 text-left">
          <span className="typo-sub1 text-text-inverse shrink-0">{date}</span>
          <span className="typo-sub1 text-text-inverse min-w-0 break-all">{title}</span>
          {isCurrentWeek && (
            <span className="typo-caption1 shrink-0 rounded-[5px] bg-white/30 px-200 py-100 text-white">
              이번 주
            </span>
          )}
        </div>
        <span className="flex shrink-0 items-center justify-center">
          <Icon src={ArrowDownIcon} size={24} className="rotate-180 text-white" />
        </span>
      </button>

      {/* Body */}
      <div className="tablet:gap-600 tablet:p-450 flex flex-col gap-400 p-300">
        {/* Search + Actions */}
        <div className="tablet:flex-row tablet:items-center tablet:justify-between flex flex-col gap-300">
          <div className="bg-container-neutral tablet:w-[492px] relative h-12 w-full rounded-sm">
            <Icon
              src={SearchIcon}
              size={24}
              className="text-icon-alternative absolute top-1/2 left-400 -translate-y-1/2"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for name"
              autoComplete="off"
              className="typo-body1 placeholder:text-text-alternative h-full w-full bg-transparent py-300 pr-300 pl-14 focus:outline-none"
            />
          </div>
          {isEditing ? (
            <div className="flex justify-end gap-200">
              <Button variant="secondary" size="lg" onClick={handleCancel} disabled={isSaving}>
                취소
              </Button>
              <Button variant="primary" size="lg" onClick={saveEdit} disabled={isSaving}>
                저장
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              onClick={startEdit}
              className="tablet:w-auto w-full"
            >
              수정
            </Button>
          )}
        </div>

        {/* Attendance grid */}
        <div className="bg-container-neutral rounded-sm">
          {/* Header row */}
          <AttendanceTableRow isEditing={isEditing} position="top" />

          {/* Member rows */}
          {isMembersLoading ? (
            Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="border-line flex border-r border-b border-l">
                <div className="flex min-w-0 flex-1 flex-col gap-200 px-400 py-300">
                  <Skeleton className="h-[20px] w-24 rounded-sm" />
                  <Skeleton className="h-[16px] w-40 rounded-sm" />
                </div>
                <div className="border-line flex w-[158px] items-center justify-center border-l">
                  <Skeleton className="h-[20px] w-16 rounded-sm" />
                </div>
              </div>
            ))
          ) : filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <AttendanceMemberRow
                key={member.id}
                member={member}
                isEditing={isEditing}
                status={getEditStatus(member.id) ?? member.status}
                onToggle={toggleStatus}
              />
            ))
          ) : (
            <div className="border-line flex items-center justify-center border-r border-b border-l py-800">
              <span className="typo-body1 text-text-alternative">검색 결과가 없습니다.</span>
            </div>
          )}

          {/* Footer row */}
          <AttendanceTableRow isEditing={isEditing} position="bottom" />
        </div>
      </div>

      <AlertDialog
        open={cancelDialogOpen}
        status="danger"
        onOpenChange={setCancelDialogOpen}
        title="변경 사항이 저장되지 않았어요"
        description={'지금 취소하면 수정 중인 내용이 사라집니다.\n계속하시겠어요?'}
      >
        <AlertDialogAction onClick={cancelEdit}>취소하기</AlertDialogAction>
        <AlertDialogCancel>계속 수정</AlertDialogCancel>
      </AlertDialog>
    </div>
  );
}

export { AttendanceCard, type AttendanceCardProps };
