'use client';

import { useState } from 'react';

import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui';
import type { TopBarAction } from '@/constants/admin/memberTopBar.constants';
import { useMediaQuery } from '@/hooks';
import type { ClubMemberRole, Member } from '@/types/admin/member';
import {
  getMemberCardinalNumbers,
  type CardinalChangeRequest,
} from '@/utils/admin/memberPageUtils';
import { ChangeCardinalsModal } from './modal/ChangeCardinalsModal';
import { MemberDetailBottomSheet } from './modal/MemberDetailBottomSheet';
import { MemberDetailModal } from './modal/MemberDetailModal';

interface ForceConfirmState {
  requests: CardinalChangeRequest[];
}

const DETAIL_BOTTOM_SHEET_EXIT_DELAY_MS = 180;

interface MemberPageModalsProps {
  detailMember: Member | null;
  cardinalModalMember: Member | null;
  forceConfirm: ForceConfirmState | null;
  isLead: boolean;
  onCloseDetail: () => void;
  onOpenCardinalModalFromDetail: (memberId: string) => void;
  onCloseCardinalModal: () => void;
  onCloseForceConfirm: () => void;
  onConfirmForceChange: () => void;
  onBan: (clubMemberIds: number[]) => void;
  onRestore: (clubMemberIds: number[]) => void;
  onChangeRole: (clubMemberIds: number[], memberRole: ClubMemberRole) => void;
  onChangeCardinals: (clubMemberIds: number[], cardinalIds: number[]) => void;
  onTransferLead: (clubMemberId: number) => void;
}

function MemberPageModals({
  detailMember,
  cardinalModalMember,
  forceConfirm,
  isLead,
  onCloseDetail,
  onOpenCardinalModalFromDetail,
  onCloseCardinalModal,
  onCloseForceConfirm,
  onConfirmForceChange,
  onBan,
  onRestore,
  onChangeRole,
  onChangeCardinals,
  onTransferLead,
}: MemberPageModalsProps) {
  const [pendingDetailAction, setPendingDetailAction] = useState<TopBarAction | null>(null);
  const isMobile = useMediaQuery('(max-width: 695.98px)');
  const detailOpen = detailMember !== null;
  const nextDetailRole =
    detailMember?.memberRole === 'ADMIN' ? 'USER' : ('ADMIN' as ClubMemberRole);
  const handleDetailRoleChange = detailMember
    ? () => onChangeRole([detailMember.clubMemberId], nextDetailRole)
    : undefined;
  const handleDetailCardinalsChange = detailMember
    ? () => onOpenCardinalModalFromDetail(detailMember.id)
    : undefined;
  const handleDetailBan = detailMember ? () => onBan([detailMember.clubMemberId]) : undefined;
  const handleDetailRestore = detailMember
    ? () => onRestore([detailMember.clubMemberId])
    : undefined;
  const handleDetailTransferLead =
    isLead && detailMember ? () => onTransferLead(detailMember.clubMemberId) : undefined;
  const handleMobileDetailActionRequest = (action: TopBarAction) => {
    onCloseDetail();
    window.setTimeout(() => {
      setPendingDetailAction(action);
    }, DETAIL_BOTTOM_SHEET_EXIT_DELAY_MS);
  };
  const handleMobileDetailCardinalsChange = detailMember
    ? () => {
        const memberId = detailMember.id;

        onCloseDetail();
        window.setTimeout(() => {
          onOpenCardinalModalFromDetail(memberId);
        }, DETAIL_BOTTOM_SHEET_EXIT_DELAY_MS);
      }
    : undefined;
  const handlePendingDetailActionConfirm = () => {
    pendingDetailAction?.handler?.();
    setPendingDetailAction(null);
  };

  return (
    <>
      {!isMobile && (
        <MemberDetailModal
          open={detailOpen}
          onOpenChange={(open) => {
            if (!open) onCloseDetail();
          }}
          member={detailMember}
          onBan={handleDetailBan}
          onRestore={handleDetailRestore}
          onChangeRole={handleDetailRoleChange}
          onChangeCardinals={handleDetailCardinalsChange}
          onTransferLead={handleDetailTransferLead}
        />
      )}

      {isMobile && (
        <MemberDetailBottomSheet
          open={detailOpen}
          onOpenChange={(open) => {
            if (!open) onCloseDetail();
          }}
          member={detailMember}
          onBan={handleDetailBan}
          onRestore={handleDetailRestore}
          onChangeRole={handleDetailRoleChange}
          onChangeCardinals={handleMobileDetailCardinalsChange}
          onTransferLead={handleDetailTransferLead}
          onActionRequest={handleMobileDetailActionRequest}
        />
      )}

      <ChangeCardinalsModal
        open={cardinalModalMember !== null}
        onOpenChange={(open) => {
          if (!open) onCloseCardinalModal();
        }}
        overline={
          cardinalModalMember
            ? `'${cardinalModalMember.name}'의 기수를 선택하세요`
            : '멤버 기수 변경'
        }
        memberCardinals={
          cardinalModalMember ? [getMemberCardinalNumbers(cardinalModalMember.cardinal)] : []
        }
        onSubmit={(cardinalIds) => {
          if (!cardinalModalMember) return;
          onChangeCardinals([cardinalModalMember.clubMemberId], cardinalIds);
        }}
      />

      <AlertDialog
        open={forceConfirm !== null}
        onOpenChange={(open) => {
          if (!open) onCloseForceConfirm();
        }}
        status="danger"
        title={`출석 기록이 있는\n기수가 포함되어 있습니다.`}
        description={'그래도 변경하시겠어요?\n출석/결석 기록도 함께 삭제됩니다.'}
      >
        <AlertDialogAction onClick={onConfirmForceChange}>변경</AlertDialogAction>
        <AlertDialogCancel>취소</AlertDialogCancel>
      </AlertDialog>

      {pendingDetailAction && (
        <AlertDialog
          open
          onOpenChange={(open) => {
            if (!open) setPendingDetailAction(null);
          }}
          title={pendingDetailAction.title}
          description={pendingDetailAction.description}
        >
          <AlertDialogAction onClick={handlePendingDetailActionConfirm}>확인</AlertDialogAction>
          <AlertDialogCancel>취소</AlertDialogCancel>
        </AlertDialog>
      )}
    </>
  );
}

export { MemberPageModals, type ForceConfirmState, type MemberPageModalsProps };
