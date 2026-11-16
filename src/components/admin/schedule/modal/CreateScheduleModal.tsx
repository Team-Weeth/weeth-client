'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import AdminCloseIcon from '@/assets/icons/admin/ic_admin_close.svg';
import { ModalIconButton } from '@/components/admin/modal/ModalIconButton';
import { CreateGeneralScheduleForm } from '@/components/admin/schedule/modal/CreateGeneralScheduleForm';
import { CreateSessionScheduleForm } from '@/components/admin/schedule/modal/CreateSessionScheduleForm';
import { SCHEDULE_MODAL_CONTENT_CLASS } from '@/components/admin/schedule/modal/constants';
import type { ScheduleType } from '@/types/admin/schedule';
import type { CreateSessionBody } from '@/types/admin/session';

interface CreateScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardinalNumber: number | null;
  activeTab: ScheduleType;
  onCreateSession?: (body: CreateSessionBody) => void;
}

function CreateScheduleModal({
  open,
  onOpenChange,
  cardinalNumber,
  activeTab,
  onCreateSession,
}: CreateScheduleModalProps) {
  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={SCHEDULE_MODAL_CONTENT_CLASS}
        showCloseButton={false}
        adminMobileFullscreen={false}
      >
        <DialogTitle className="sr-only">일정 생성</DialogTitle>
        <div className="bg-background flex h-[96px] shrink-0 items-center justify-between pr-[10px] pl-700">
          <h2 className="typo-h3 text-text-normal m-0">
            {activeTab === 'SESSION' ? '세션 생성' : '일반 일정 생성'}
          </h2>
          <ModalIconButton icon={AdminCloseIcon} label="닫기" onClick={handleClose} />
        </div>

        {activeTab === 'SESSION' ? (
          <CreateSessionScheduleForm onCreateSession={onCreateSession} onClose={handleClose} />
        ) : (
          <CreateGeneralScheduleForm cardinalNumber={cardinalNumber} onClose={handleClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

export { CreateScheduleModal, type CreateScheduleModalProps };
