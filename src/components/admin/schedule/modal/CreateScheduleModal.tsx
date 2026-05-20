'use client';

import { Icon, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AdminCloseIcon } from '@/assets/icons/admin';
import { CreateGeneralScheduleForm } from '@/components/admin/schedule/modal/CreateGeneralScheduleForm';
import { CreateSessionScheduleForm } from '@/components/admin/schedule/modal/CreateSessionScheduleForm';
import { SCHEDULE_TYPE_LABEL } from '@/constants/admin/schedule.constants';
import type { ScheduleType } from '@/types/admin/schedule';
import type { CreateSessionBody } from '@/types/admin/session';

interface CreateScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardinalNumber: number | null;
  activeTab: ScheduleType;
  onActiveTabChange: (tab: ScheduleType) => void;
  onCreateSession?: (body: CreateSessionBody) => void;
}

function CreateScheduleModal({
  open,
  onOpenChange,
  cardinalNumber,
  activeTab,
  onActiveTabChange,
  onCreateSession,
}: CreateScheduleModalProps) {
  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-background flex w-215 max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-lg p-0"
        showCloseButton={false}
      >
        {/* Header with tabs */}
        <div className="tablet:px-700 tablet:pt-700 flex items-start justify-between px-400 pt-400">
          <Tabs
            value={activeTab}
            onValueChange={(v) => onActiveTabChange(v as ScheduleType)}
            className="gap-0"
          >
            <TabsList variant="line" className="h-8">
              <TabsTrigger value="EVENT">{SCHEDULE_TYPE_LABEL.EVENT}</TabsTrigger>
              <TabsTrigger value="SESSION">{SCHEDULE_TYPE_LABEL.SESSION}</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="hidden" />
          </Tabs>
          <button
            type="button"
            onClick={handleClose}
            className="flex cursor-pointer items-center justify-center rounded-sm p-200"
            aria-label="닫기"
          >
            <Icon src={AdminCloseIcon} size={24} alt="닫기" />
          </button>
        </div>

        {/* Tab content */}
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
