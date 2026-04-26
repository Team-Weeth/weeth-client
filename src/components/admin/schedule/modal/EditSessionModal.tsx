'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { CustomAlertDialog } from '@/components/alert';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AdminCloseIcon, AdminMeatballIcon } from '@/assets/icons/admin';
import { ModalIconButton } from '@/components/admin';
import { useAdminSessionDetail } from '@/hooks/queries/admin/useAdminScheduleQueries';
import type {
  AdminSession,
  AdminSessionGroup,
  UpdateSessionBody,
} from '@/types/admin/session';
import {
  isFormChanged,
  isScheduleTitleValid,
  isSessionGroup,
  toInitialScheduleForm,
} from '@/utils/admin/scheduleFormUtils';

import { DiscardConfirmArea } from './DiscardConfirmArea';
import { ScheduleFormBody } from './ScheduleFormBody';
import type { ScheduleFormState, SessionDeleteType, SessionSaveType } from './types';

interface EditSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: AdminSession | AdminSessionGroup;
  onDelete?: (type: SessionDeleteType) => void;
  /** 비반복 세션은 type='this'로 호출됨. sessionId는 PATCH 대상 (그룹이면 대표 세션) */
  onSave?: (sessionId: number, body: UpdateSessionBody, type: SessionSaveType) => void;
}

/** 그룹/단일 어느 쪽이 와도 PATCH 대상이 되는 sessionId를 결정 */
function resolveSessionId(target: AdminSession | AdminSessionGroup): number | null {
  if (!isSessionGroup(target)) return target.id;
  return target.sessions[0]?.id ?? null;
}

function toUpdateBody(form: ScheduleFormState): UpdateSessionBody {
  return {
    title: form.title.trim(),
    content: form.content,
    location: form.location,
    start: `${form.startDate}T${form.startTime}:00`,
    end: `${form.endDate}T${form.endTime}:00`,
  };
}

function EditSessionModal({ open, onOpenChange, target, onDelete, onSave }: EditSessionModalProps) {
  const sessionId = resolveSessionId(target);
  const isRecurring = isSessionGroup(target);
  const hasChangesRef = useRef(false);
  const requestCloseRef = useRef<(() => void) | null>(null);

  const handleClose = () => onOpenChange(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) return;
        if (requestCloseRef.current) requestCloseRef.current();
        else handleClose();
      }}
    >
      <DialogContent
        className="bg-background flex w-215 max-w-215 flex-col gap-0 overflow-hidden rounded-lg p-0"
        showCloseButton={false}
        onPointerDownOutside={(e) => {
          if (hasChangesRef.current) e.preventDefault();
        }}
      >
        {sessionId === null ? (
          <EditSessionModalLoading onClose={handleClose} />
        ) : (
          <Suspense fallback={<EditSessionModalLoading onClose={handleClose} />}>
            <EditSessionModalContent
              sessionId={sessionId}
              isRecurring={isRecurring}
              onClose={handleClose}
              onSave={onSave}
              onDelete={onDelete}
              hasChangesRef={hasChangesRef}
              requestCloseRef={requestCloseRef}
            />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditSessionModalLoading({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="flex items-start justify-between px-700 pt-700">
        <div className="flex h-8 items-end">
          <span className="typo-button2 text-text-strong border-brand-primary border-b-2 px-100 pb-200">
            세션
          </span>
        </div>
        <ModalIconButton icon={AdminCloseIcon} label="닫기" onClick={onClose} />
      </div>
      <div className="flex min-h-150 flex-col px-700 pb-700">
        <h2 className="typo-h3 text-text-normal py-400">세션 수정</h2>
        <div className="flex flex-1 items-center justify-center">
          <p className="typo-body2 text-text-alternative">불러오는 중...</p>
        </div>
      </div>
    </>
  );
}

interface EditSessionModalContentProps {
  sessionId: number;
  isRecurring: boolean;
  onClose: () => void;
  onSave?: (sessionId: number, body: UpdateSessionBody, type: SessionSaveType) => void;
  onDelete?: (type: SessionDeleteType) => void;
  hasChangesRef: RefObject<boolean>;
  requestCloseRef: RefObject<(() => void) | null>;
}

function EditSessionModalContent({
  sessionId,
  isRecurring,
  onClose,
  onSave,
  onDelete,
  hasChangesRef,
  requestCloseRef,
}: EditSessionModalContentProps) {
  const { data: detail } = useAdminSessionDetail(sessionId);

  const [initialForm] = useState<ScheduleFormState>(() => toInitialScheduleForm(detail));
  const [form, setForm] = useState<ScheduleFormState>(initialForm);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [discardSource, setDiscardSource] = useState<'close' | 'cancel' | null>(null);

  const hasChanges = isFormChanged(form, initialForm);
  const isValid = isScheduleTitleValid(form.title);

  const updateForm = (patch: Partial<ScheduleFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleTryClose = (source: 'close' | 'cancel') => {
    if (hasChanges) setDiscardSource(source);
    else onClose();
  };

  useEffect(() => {
    hasChangesRef.current = hasChanges;
    requestCloseRef.current = () => {
      if (hasChanges) setDiscardSource('close');
      else onClose();
    };
    return () => {
      hasChangesRef.current = false;
      requestCloseRef.current = null;
    };
  }, [hasChanges, hasChangesRef, onClose, requestCloseRef]);

  const handleSubmit = () => {
    if (!isValid) return;
    if (isRecurring) {
      setSaveConfirmOpen(true);
    } else {
      onSave?.(sessionId, toUpdateBody(form), 'this');
      onClose();
    }
  };

  const handleSaveConfirm = (type: SessionSaveType) => {
    setSaveConfirmOpen(false);
    onClose();
    onSave?.(sessionId, toUpdateBody(form), type);
  };

  const handleDeleteConfirm = (type: SessionDeleteType) => {
    setDeleteConfirmOpen(false);
    onClose();
    onDelete?.(type);
  };

  const handleDiscardConfirm = () => {
    setDiscardSource(null);
    onClose();
  };

  const closeDiscardAlert = (source: 'close' | 'cancel') => (next: boolean) => {
    if (!next && discardSource === source) setDiscardSource(null);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between px-700 pt-700">
        <div className="flex h-8 items-end">
          <span className="typo-button2 text-text-strong border-brand-primary border-b-2 px-100 pb-200">
            세션
          </span>
        </div>
        <div className="flex items-center gap-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ModalIconButton icon={AdminMeatballIcon} label="메뉴" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem destructive onSelect={() => setDeleteConfirmOpen(true)}>
                세션 삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DiscardConfirmArea
            open={discardSource === 'close'}
            onOpenChange={closeDiscardAlert('close')}
            onConfirm={handleDiscardConfirm}
            placement="below-right"
          >
            <ModalIconButton
              icon={AdminCloseIcon}
              label="닫기"
              onClick={() => handleTryClose('close')}
            />
          </DiscardConfirmArea>
        </div>
      </div>

      {/* Body */}
      <div className="scrollbar-custom max-h-175 overflow-y-auto px-15">
        <h2 className="typo-h3 text-text-normal py-400">세션 수정</h2>
        <ScheduleFormBody
          form={form}
          onFormChange={updateForm}
          titleLabel="세션 제목"
          titlePlaceholder="예 : 7기 정기 모임"
        />
      </div>

      {/* Footer */}
      <div className="bg-container-neutral flex items-center justify-end gap-200 px-400 pt-400 pb-500">
        <DiscardConfirmArea
          open={discardSource === 'cancel'}
          onOpenChange={closeDiscardAlert('cancel')}
          onConfirm={handleDiscardConfirm}
          placement="above-right"
        >
          <Button variant="secondary" size="lg" onClick={() => handleTryClose('cancel')}>
            취소
          </Button>
        </DiscardConfirmArea>
        <Button variant="primary" size="lg" disabled={!isValid} onClick={handleSubmit}>
          저장
        </Button>
      </div>

      {/* 저장 확인 (반복 세션 전용) */}
      <CustomAlertDialog
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        title="이 변경사항을 어떻게 저장할까요?"
        actionLabel="이 세션 일정만 저장"
        onAction={() => handleSaveConfirm('this')}
        secondActionLabel="이후 모든 세션 일정에 대해 저장"
        onSecondAction={() => handleSaveConfirm('all')}
        placement="center"
        tone="primary"
      />

      {/* 삭제 확인 */}
      {isRecurring ? (
        <CustomAlertDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title={'이 세션을 삭제하시겠어요?\n반복 설정이 되어있는 세션이에요.'}
          actionLabel="이 세션 일정만 삭제"
          onAction={() => handleDeleteConfirm('this')}
          secondActionLabel="이후 모든 세션 일정 삭제"
          onSecondAction={() => handleDeleteConfirm('all')}
          placement="center"
        />
      ) : (
        <CustomAlertDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="이 세션을 삭제하시겠어요?"
          description={'삭제된 세션은 복구할 수 없습니다.\n신중히 확인 후 진행해 주세요.'}
          actionLabel="삭제"
          onAction={() => handleDeleteConfirm('this')}
          placement="center"
        />
      )}
    </>
  );
}

export { EditSessionModal, type EditSessionModalProps };
