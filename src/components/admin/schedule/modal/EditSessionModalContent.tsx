'use client';

import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { CustomAlertDialog } from '@/components/alert';
import { AdminCloseIcon, AdminMeatballIcon } from '@/assets/icons/admin';
import { ModalIconButton } from '@/components/admin';
import { useSessionMutations } from '@/hooks/admin';
import { useAdminSessionDetail } from '@/hooks/queries/admin/useAdminScheduleQueries';
import type { SessionUpdateScope, UpdateSessionBody } from '@/types/admin/session';
import {
  isFormChanged,
  isScheduleTitleValid,
  toInitialScheduleForm,
} from '@/utils/admin/scheduleFormUtils';

import { SCHEDULE_MODAL_FOOTER_CLASS } from './constants';
import { DiscardConfirmArea } from './DiscardConfirmArea';
import { ScheduleFormBody } from './ScheduleFormBody';
import { isDateRangeValid } from './types';
import type { ScheduleFormState, SessionDeleteType, SessionSaveType } from './types';

interface EditSessionModalContentProps {
  sessionId: number;
  isRecurring: boolean;
  /**
   * 반복 그룹의 자식 세션을 수정 중인지 여부.
   * - true: "이후 모두 삭제"는 이 세션 + 이후 세션만 삭제 (THIS_AND_FUTURE)
   * - false: "이후 모두 삭제"는 그룹 전체 삭제 (submitDeleteGroup)
   */
  isChildOfRecurringGroup?: boolean;
  /** 반복 세션일 때만 값이 있음 (그룹 전체 삭제용) */
  groupId: number | null;
  onClose: () => void;
  hasChangesRef: RefObject<boolean>;
  requestCloseRef: RefObject<(() => void) | null>;
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

function EditSessionModalContent({
  sessionId,
  isRecurring,
  isChildOfRecurringGroup = false,
  groupId,
  onClose,
  hasChangesRef,
  requestCloseRef,
}: EditSessionModalContentProps) {
  const { data: detail } = useAdminSessionDetail(sessionId);

  const [initialForm] = useState<ScheduleFormState>(() => toInitialScheduleForm(detail));
  const [form, setForm] = useState<ScheduleFormState>(initialForm);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [discardSource, setDiscardSource] = useState<'close' | 'cancel' | null>(null);

  const { submitUpdate, submitDeleteSession, submitDeleteGroup, forceConfirmDialog } =
    useSessionMutations();

  const hasChanges = isFormChanged(form, initialForm);
  const isValid = isScheduleTitleValid(form.title) && isDateRangeValid(form);

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

  const runUpdate = (type: SessionSaveType) => {
    const scope: SessionUpdateScope = type === 'all' ? 'THIS_AND_FUTURE' : 'THIS_ONLY';
    submitUpdate(sessionId, toUpdateBody(form), scope, false, { onSuccess: onClose });
  };

  const handleSubmit = () => {
    if (!isValid) return;
    if (isRecurring) {
      setSaveConfirmOpen(true);
    } else {
      runUpdate('this');
    }
  };

  const handleSaveConfirm = (type: SessionSaveType) => {
    setSaveConfirmOpen(false);
    runUpdate(type);
  };

  const handleDeleteConfirm = (type: SessionDeleteType) => {
    setDeleteConfirmOpen(false);
    if (isRecurring && type === 'all') {
      // 자식 세션이면 "이 세션 + 이후"만 삭제, 그룹 자체를 수정 중이면 그룹 전체 삭제
      if (isChildOfRecurringGroup) {
        submitDeleteSession(sessionId, 'THIS_AND_FUTURE', false, { onSuccess: onClose });
      } else if (groupId !== null) {
        submitDeleteGroup(groupId, false, { onSuccess: onClose });
      }
    } else {
      submitDeleteSession(sessionId, 'THIS_ONLY', false, { onSuccess: onClose });
    }
  };

  const handleDiscardConfirm = () => {
    setDiscardSource(null);
    onClose();
  };

  const closeDiscardAlert = (source: 'close' | 'cancel') => (next: boolean) => {
    if (!next && discardSource === source) setDiscardSource(null);
  };

  // 삭제 확인 다이얼로그 분기 — 자식 세션 / 반복 그룹 / 단일 세션
  const deleteDialogProps =
    isRecurring && isChildOfRecurringGroup
      ? {
          title: '이 세션을 삭제하시겠어요?\n반복 설정이 되어있는 세션이에요.',
          actionLabel: '이 세션 일정만 삭제',
          onAction: () => handleDeleteConfirm('this'),
          secondActionLabel: '이후 모든 세션 일정 삭제',
          onSecondAction: () => handleDeleteConfirm('all'),
        }
      : isRecurring
        ? {
            title: '반복 설정이 되어있는 세션이에요.\n모든 세션 일정을 삭제하시겠어요?',
            actionLabel: '이후 모든 세션 일정 삭제',
            onAction: () => handleDeleteConfirm('all'),
          }
        : {
            title: '이 세션을 삭제하시겠어요?',
            description: '삭제된 세션은 복구할 수 없습니다.\n신중히 확인 후 진행해 주세요.',
            actionLabel: '삭제',
            onAction: () => handleDeleteConfirm('this'),
          };

  return (
    <>
      {/* Header */}
      <div className="tablet:px-700 tablet:pt-700 flex items-start justify-between px-400 pt-400">
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
      <div className="scrollbar-custom tablet:px-15 min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-400 [-webkit-overflow-scrolling:touch]">
        <h2 className="typo-h3 text-text-normal py-400">세션 수정</h2>
        <ScheduleFormBody
          form={form}
          onFormChange={updateForm}
          titleLabel="세션 제목"
          titlePlaceholder="예 : 7기 정기 모임"
        />
      </div>

      {/* Footer */}
      <div className={SCHEDULE_MODAL_FOOTER_CLASS}>
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
        {/* 저장 + 반복 세션 저장 확인 alert */}
        <CustomAlertDialog
          open={saveConfirmOpen}
          onOpenChange={setSaveConfirmOpen}
          title="이 변경사항을 어떻게 저장할까요?"
          actionLabel="이 세션 일정만 저장"
          onAction={() => handleSaveConfirm('this')}
          secondActionLabel="이후 모든 세션 일정에 대해 저장"
          onSecondAction={() => handleSaveConfirm('all')}
          placement="above-right"
          tone="primary"
        >
          <Button variant="primary" size="lg" disabled={!isValid} onClick={handleSubmit}>
            저장
          </Button>
        </CustomAlertDialog>
      </div>

      {/* 삭제 확인 */}
      <CustomAlertDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        placement="center"
        {...deleteDialogProps}
      />

      {/* CLOSED 세션 포함 시 force=true 재요청 동의 (modal 위에 overlay) */}
      {forceConfirmDialog}
    </>
  );
}

export { EditSessionModalContent, type EditSessionModalContentProps };
