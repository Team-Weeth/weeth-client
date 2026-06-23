'use client';

import { AdminCloseIcon } from '@/assets/icons/admin';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ModalIconButton } from '@/components/admin/modal/ModalIconButton';
import { SCHEDULE_MODAL_CONTENT_CLASS } from '@/components/admin/schedule/modal/constants';
import { TransactionForm, type TransactionFormData } from './TransactionForm';
import { useResetKeyOnOpen } from '@/hooks/useResetKeyOnOpen';

interface EditTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<TransactionFormData>;
  onSubmit?: (data: TransactionFormData) => void;
}

function EditTransactionModal({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
}: EditTransactionModalProps) {
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
          <h2 className="typo-h3 text-text-normal">거래내역 수정</h2>
          <ModalIconButton icon={AdminCloseIcon} label="닫기" onClick={handleClose} />
        </div>

        <TransactionForm
          key={formKey}
          initialValues={initialValues}
          onSubmit={(data) => {
            onSubmit?.(data);
            handleClose();
          }}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}

export { EditTransactionModal, type EditTransactionModalProps };
