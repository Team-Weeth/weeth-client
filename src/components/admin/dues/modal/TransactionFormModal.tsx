'use client';

import AdminCloseIcon from '@/assets/icons/admin/ic_admin_close.svg';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ModalIconButton } from '@/components/admin/modal/ModalIconButton';
import { SCHEDULE_MODAL_CONTENT_CLASS } from '@/components/admin/schedule/modal/constants';
import { TransactionForm, type TransactionFormData } from './TransactionForm';
import { useResetKeyOnOpen } from '@/hooks/useResetKeyOnOpen';

interface TransactionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 모달 제목 (예: '거래내역 추가', '거래내역 수정') */
  title: string;
  /** 수정 시 폼 초기값 */
  initialValues?: Partial<TransactionFormData>;
  /** 일자 선택 가능한 최소 날짜 (YYYY-MM-DD) 총 회비 등록 시작 월 기준. */
  minDate?: string;
  /** 일자 선택 가능한 최대 날짜 (YYYY-MM-DD) 오늘 날짜. */
  maxDate?: string;
  onSubmit?: (data: TransactionFormData) => void | Promise<void>;
}

function TransactionFormModal({
  open,
  onOpenChange,
  title,
  initialValues,
  minDate,
  maxDate,
  onSubmit,
}: TransactionFormModalProps) {
  const formKey = useResetKeyOnOpen(open);
  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={SCHEDULE_MODAL_CONTENT_CLASS}
        showCloseButton={false}
        adminMobileFullscreen={false}
      >
        <div className="flex h-24 shrink-0 items-center justify-between px-600">
          <h2 className="typo-h3 text-text-normal">{title}</h2>
          <ModalIconButton icon={AdminCloseIcon} label="닫기" onClick={handleClose} />
        </div>

        <TransactionForm
          key={formKey}
          initialValues={initialValues}
          minDate={minDate}
          maxDate={maxDate}
          onSubmit={async (data) => {
            // 제출이 실패하면(예: 잔액 부족) 예외가 폼으로 전파돼 모달 유지
            await onSubmit?.(data);
            handleClose();
          }}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}

export { TransactionFormModal, type TransactionFormModalProps };
