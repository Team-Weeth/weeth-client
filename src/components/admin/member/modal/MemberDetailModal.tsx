'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import AdminCloseIcon from '@/assets/icons/admin/ic_admin_close.svg';
import { getFooterActions } from '@/constants/admin/memberDetailModal.constants';
import { isMemberStateAction } from '@/constants/admin/memberTopBar.constants';
import type { FooterAction } from '@/constants/admin/memberDetailModal.constants';
import type { Member } from '@/types/admin/member';
import {
  MemberActivityInfoCard,
  MemberDetailSummary,
  MemberPersonalInfoCard,
} from './MemberDetailSections';

interface MemberDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onChangeRole?: () => void;
  onChangePosition?: () => void;
  onBan?: () => void;
  onRestore?: () => void;
  onChangeCardinals?: () => void;
  onTransferLead?: () => void;
}

function MemberDetailModal({
  open,
  onOpenChange,
  member,
  onChangeRole,
  onChangePosition,
  onBan,
  onRestore,
  onChangeCardinals,
  onTransferLead,
}: MemberDetailModalProps) {
  if (!member) return null;

  const handleClose = () => onOpenChange(false);

  const footerActions = getFooterActions({
    memberRole: member.memberRole,
    status: member.status,
    onChangeRole,
    onBan,
    onRestore,
    onTransferLead,
  });

  const actionNodes = footerActions.map((action) => (
    <FooterActionDialog key={action.id} action={action} />
  ));

  if (onChangePosition) {
    // 상단 선택 바와 동일하게 포지션 변경은 유저 추방/복구 앞에 배치한다.
    const memberStateIndex = footerActions.findIndex(isMemberStateAction);
    actionNodes.splice(
      memberStateIndex === -1 ? actionNodes.length : memberStateIndex,
      0,
      <Button
        key="changePosition"
        variant="secondary"
        size="md"
        className="rounded-sm"
        onClick={onChangePosition}
      >
        포지션 변경
      </Button>,
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-background flex w-[770px] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-lg p-0"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between px-700 pt-700 pb-500">
          <DialogTitle className="typo-h3 text-text-strong">멤버 상세</DialogTitle>
          <button
            type="button"
            onClick={handleClose}
            className="flex cursor-pointer items-center justify-center rounded-sm p-200"
            aria-label="닫기"
          >
            <Icon src={AdminCloseIcon} size={24} alt="닫기버튼" />
          </button>
        </div>

        <div className="flex flex-col gap-500 overflow-y-auto px-700 pt-200 pb-600">
          <MemberDetailSummary member={member} className="px-500 py-[18px]" />

          <div className="tablet:grid-cols-2 grid grid-cols-1 gap-[14px]">
            <MemberPersonalInfoCard member={member} />
            <MemberActivityInfoCard member={member} />
          </div>
        </div>

        <div className="bg-container-neutral flex flex-wrap items-center justify-between gap-200 px-700 py-500">
          <div className="flex flex-wrap items-center gap-200">
            {actionNodes}
            {onChangeCardinals && (
              <Button
                variant="secondary"
                size="md"
                className="rounded-sm"
                onClick={onChangeCardinals}
              >
                기수 변경
              </Button>
            )}
          </div>

          <Button variant="primary" size="md" className="rounded-sm" onClick={handleClose}>
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FooterActionDialog({ action }: { action: FooterAction }) {
  const { id, label, title, description, handler } = action;

  return (
    <AlertDialog
      status={id === 'ban' ? 'danger' : 'default'}
      title={title}
      description={description}
      trigger={
        <Button variant="secondary" size="md" className="rounded-sm">
          {label}
        </Button>
      }
    >
      <AlertDialogAction onClick={handler}>{id === 'ban' ? '추방' : '확인'}</AlertDialogAction>
      <AlertDialogCancel>취소</AlertDialogCancel>
    </AlertDialog>
  );
}

export { MemberDetailModal, type MemberDetailModalProps };
