'use client';

import { BottomSheet, BottomSheetActionItem } from '@/components/ui/bottom-sheet/BottomSheet';
import type { ScheduleType } from '@/types/admin/schedule';

interface AdminScheduleCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: ScheduleType) => void;
}

function AdminScheduleCreateSheet({ open, onOpenChange, onSelect }: AdminScheduleCreateSheetProps) {
  const handleSelect = (type: ScheduleType) => {
    onOpenChange(false);
    onSelect(type);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="일정 유형 선택"
      bodyClassName="py-200"
      footerClassName="pt-100"
    >
      <div className="flex flex-col gap-100">
        <BottomSheetActionItem onClick={() => handleSelect('EVENT')}>
          일반 일정
        </BottomSheetActionItem>
        <BottomSheetActionItem onClick={() => handleSelect('SESSION')}>세션</BottomSheetActionItem>
      </div>
    </BottomSheet>
  );
}

export { AdminScheduleCreateSheet, type AdminScheduleCreateSheetProps };
