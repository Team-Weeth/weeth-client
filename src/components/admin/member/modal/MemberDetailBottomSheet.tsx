'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  BottomSheet,
  Button,
} from '@/components/ui';
import { getTopBarActions } from '@/constants/admin/memberTopBar.constants';
import type { TopBarAction } from '@/constants/admin/memberTopBar.constants';
import type { Member } from '@/types/admin/member';
import {
  MemberActivityInfoCard,
  MemberDetailSummary,
  MemberPersonalInfoCard,
} from './MemberDetailSections';

interface MemberDetailBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onApprove?: () => void;
  onChangeRole?: () => void;
  onBan?: () => void;
  onRestore?: () => void;
  onChangeCardinals?: () => void;
  onTransferLead?: () => void;
  onActionRequest?: (action: TopBarAction) => void;
}

function MemberDetailBottomSheet({
  open,
  onOpenChange,
  member,
  onApprove,
  onChangeRole,
  onBan,
  onRestore,
  onChangeCardinals,
  onTransferLead,
  onActionRequest,
}: MemberDetailBottomSheetProps) {
  if (!member) return null;

  const targetRole = member.memberRole === 'ADMIN' ? 'USER' : 'ADMIN';
  const targetBanAction = member.status === 'BANNED' ? 'restore' : 'ban';
  const actions = getTopBarActions({
    selectedCount: 1,
    targetRole,
    targetBanAction,
    onApprove,
    onChangeRole,
    onBan,
    onRestore,
    onTransferLead,
  });

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="멤버 상세"
      expandable
      initialSnapHeight={620}
      topGap={40}
      closeThreshold={0.12}
      scrollLockTimeout={150}
      showCancelButton={false}
      bodyClassName="flex flex-col gap-400 px-400 py-400"
      footerClassName="border-line border-t bg-neutral-200 px-400 pt-300 pb-600"
      footer={
        <div className="flex flex-col gap-400">
          <div className="flex flex-wrap gap-200">
            {actions.map((action) => (
              <MemberDetailActionButton
                key={action.id}
                action={action}
                onActionRequest={onActionRequest}
              />
            ))}

            {onChangeCardinals && (
              <Button
                variant="secondary"
                size="md"
                className="bg-neutral-0 rounded-sm hover:bg-neutral-100 active:bg-neutral-100"
                onClick={() => {
                  onOpenChange(false);
                  onChangeCardinals();
                }}
              >
                기수 변경
              </Button>
            )}
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full rounded-md"
            onClick={() => onOpenChange(false)}
          >
            완료
          </Button>
        </div>
      }
    >
      <MemberDetailSummary
        member={member}
        avatarSize={64}
        className="bg-neutral-200 px-400 py-300"
      />
      <MemberPersonalInfoCard member={member} />
      <MemberActivityInfoCard member={member} />
    </BottomSheet>
  );
}

interface MemberDetailActionButtonProps {
  action: TopBarAction;
  onActionRequest?: (action: TopBarAction) => void;
}

function MemberDetailActionButton({ action, onActionRequest }: MemberDetailActionButtonProps) {
  const button = (
    <Button
      variant="secondary"
      size="md"
      className="bg-neutral-0 rounded-sm hover:bg-neutral-100 active:bg-neutral-100"
      disabled={action.disabled}
      onClick={() => onActionRequest?.(action)}
    >
      {action.label}
    </Button>
  );

  if (onActionRequest) return button;

  return (
    <AlertDialog title={action.title} description={action.description} trigger={button}>
      <AlertDialogAction onClick={action.handler}>확인</AlertDialogAction>
      <AlertDialogCancel>취소</AlertDialogCancel>
    </AlertDialog>
  );
}

export { MemberDetailBottomSheet, type MemberDetailBottomSheetProps };
