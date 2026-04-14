'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, Button, Icon } from '@/components/ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChangeCardinalsModal } from '@/components/admin/member/modal/ChangeCardinalsModal';
import { cn } from '@/lib/cn';
import { AdminCloseIcon } from '@/assets/icons/admin';
import {
  STATUS_LABEL,
  STATUS_DOT_COLOR,
  getPersonalInfo,
  getActivityInfo,
  getActivityStats,
  getFooterActions,
} from '@/constants/admin/memberDetailModal.constants';
import type { Member } from '@/types/admin/member';

interface MemberDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onApprove?: () => void;
  onChangeRole?: () => void;
  onResetPassword?: () => void;
  onBan?: () => void;
  onRestore?: () => void;
  onChangeCardinals?: (cardinalIds: number[]) => void;
}

function MemberDetailModal({
  open,
  onOpenChange,
  member,
  onApprove,
  onChangeRole,
  onResetPassword,
  onBan,
  onRestore,
  onChangeCardinals,
}: MemberDetailModalProps) {
  if (!member) return null;

  const handleClose = () => onOpenChange(false);

  const personalInfo = getPersonalInfo(member);
  const activityInfo = getActivityInfo(member);
  const activityStats = getActivityStats(member);
  const footerActions = getFooterActions({
    memberRole: member.memberRole,
    status: member.status,
    onApprove,
    onChangeRole,
    onResetPassword,
    onBan,
    onRestore,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-background flex w-215 max-w-[860px] flex-col gap-0 rounded-sm p-0"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-600 pt-700 pb-400">
          <h2 className="typo-h3 text-text-normal">멤버 관리 상세</h2>
          <button
            type="button"
            onClick={handleClose}
            className="flex cursor-pointer items-center justify-center rounded-sm p-200"
            aria-label="닫기"
          >
            <Icon src={AdminCloseIcon} size={24} alt="닫기버튼" />
          </button>
        </div>

        {/* Body */}
        <div className="flex gap-500 px-700 pb-500">
          {/* 회원정보 */}
          <div className="bg-container-neutral flex-1 rounded-md p-400">
            <p className="typo-caption1 text-text-alternative mb-400">회원정보</p>

            <div className="mb-200 flex items-baseline gap-200">
              <span className="typo-h3 text-text-strong">{member.name}</span>
              <span className="typo-h3 text-text-strong">
                {parseInt(member.generation, 10) || member.generation || '-'}기
              </span>
            </div>

            <div className="mb-400 flex items-center gap-200">
              <span className={cn('size-1', STATUS_DOT_COLOR[member.status])} />
              <span className="typo-caption2 text-text-strong">{STATUS_LABEL[member.status]}</span>
            </div>

            <div className="flex flex-col gap-400">
              {personalInfo.map(({ label, value }) => (
                <div key={label} className="flex items-start">
                  <span className="typo-body1 text-text-alternative w-24 shrink-0">{label}</span>
                  <span className="typo-body1 text-text-strong">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 활동정보 */}
          <div className="bg-container-neutral w-80 shrink-0 rounded-md p-400">
            <p className="typo-caption1 text-text-alternative mb-400">활동정보</p>

            <div className="flex flex-col gap-400">
              {activityInfo.map(({ label, value }) => (
                <div key={label} className="flex items-start">
                  <span className="typo-body1 text-text-alternative w-24 shrink-0">{label}</span>
                  <span className="typo-body1 text-text-strong">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-500 flex flex-col gap-200">
              {activityStats.map(({ label, value, color }) => (
                <div key={label} className="flex items-start">
                  <span className="typo-body1 text-text-alternative w-24 shrink-0">{label}</span>
                  <span className={cn('typo-body1', color)}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-container-neutral flex items-center justify-between rounded-b-sm px-400 pt-400 pb-500">
          <div className="flex items-center gap-200">
            {footerActions.map(({ label, title, handler }) => (
              <AlertDialog
                key={label}
                title={title}
                trigger={
                  <Button variant="secondary" size="lg">
                    {label}
                  </Button>
                }
              >
                <AlertDialogAction onClick={handler}>확인</AlertDialogAction>
                <AlertDialogCancel>취소</AlertDialogCancel>
              </AlertDialog>
            ))}
            {onChangeCardinals && (
              <ChangeCardinalsModal onSubmit={onChangeCardinals}>
                <Button variant="secondary" size="lg">
                  기수 변경
                </Button>
              </ChangeCardinalsModal>
            )}
          </div>

          <Button variant="primary" size="lg" onClick={handleClose}>
            완료
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { MemberDetailModal, type MemberDetailModalProps };
