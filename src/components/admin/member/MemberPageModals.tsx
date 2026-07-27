import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui';
import type { ClubMemberRole, Member } from '@/types/admin/member';
import {
  getMemberCardinalNumbers,
  type CardinalChangeRequest,
} from '@/utils/admin/memberPageUtils';
import { ChangeCardinalsModal } from './modal/ChangeCardinalsModal';
import { MemberDetailModal } from './modal/MemberDetailModal';

interface ForceConfirmState {
  requests: CardinalChangeRequest[];
}

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
  return (
    <>
      <MemberDetailModal
        open={detailMember !== null}
        onOpenChange={(open) => {
          if (!open) onCloseDetail();
        }}
        member={detailMember}
        onBan={detailMember ? () => onBan([detailMember.clubMemberId]) : undefined}
        onRestore={detailMember ? () => onRestore([detailMember.clubMemberId]) : undefined}
        onChangeRole={
          detailMember
            ? () => {
                const nextRole = detailMember.memberRole === 'ADMIN' ? 'USER' : 'ADMIN';
                onChangeRole([detailMember.clubMemberId], nextRole);
              }
            : undefined
        }
        onChangeCardinals={
          detailMember ? () => onOpenCardinalModalFromDetail(detailMember.id) : undefined
        }
        onTransferLead={
          isLead && detailMember ? () => onTransferLead(detailMember.clubMemberId) : undefined
        }
      />

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
    </>
  );
}

export { MemberPageModals, type ForceConfirmState, type MemberPageModalsProps };
