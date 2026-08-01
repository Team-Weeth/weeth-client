import { useState } from 'react';

import { MEMBER_CARDINAL_ERROR_CODE, MEMBER_ROLE_ERROR_CODE } from '@/constants/errorCode';
import {
  useBanMember,
  useChangeMemberCardinals,
  useChangeMemberRole,
  useRestoreMember,
  useTransferLead,
} from '@/hooks/mutations/admin';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import type { Cardinal } from '@/types/admin/cardinal';
import type { ClubMemberRole, Member } from '@/types/admin/member';
import { getBulkBanAction, getBulkTargetRole } from '@/utils/admin/memberBulkActions';
import {
  createBulkCardinalChangeRequests,
  type CardinalChangeRequest,
} from '@/utils/admin/memberPageUtils';
import { getApiErrorCode } from '@/utils/shared';
import { runBulkMutation } from '@/utils/shared/runBulkMutation';
import type { ForceConfirmState } from '../MemberPageModals';

interface UseMemberBulkActionsParams {
  cardinals: Cardinal[];
  isLead: boolean;
  selectedMembers: Member[];
  selectedMemberCardinals: number[][];
}

function useMemberBulkActions({
  cardinals,
  isLead,
  selectedMembers,
  selectedMemberCardinals,
}: UseMemberBulkActionsParams) {
  const { mutateAsync: changeMemberRoleAsync } = useChangeMemberRole();
  const { mutateAsync: banMemberAsync } = useBanMember();
  const { mutateAsync: restoreMemberAsync } = useRestoreMember();
  const { mutateAsync: changeMemberCardinalsAsync } = useChangeMemberCardinals();
  const { mutate: transferLead } = useTransferLead();
  const [forceConfirm, setForceConfirm] = useState<ForceConfirmState | null>(null);

  const targetRole = getBulkTargetRole(selectedMembers);
  const targetBanAction = getBulkBanAction(selectedMembers);

  const submitCardinalChangeRequests = async (requests: CardinalChangeRequest[], force = false) => {
    const results = await Promise.allSettled(
      requests.map(({ clubMemberId, cardinalIds }) =>
        changeMemberCardinalsAsync({ clubMemberId, cardinalIds, force }),
      ),
    );

    const attendanceFailedRequests: CardinalChangeRequest[] = [];
    let otherErrorCount = 0;

    results.forEach((result, idx) => {
      if (result.status !== 'rejected') return;
      const code = getApiErrorCode(result.reason);
      if (code === MEMBER_CARDINAL_ERROR_CODE.REMOVAL_HAS_ATTENDANCE) {
        attendanceFailedRequests.push(requests[idx]);
      } else {
        otherErrorCount += 1;
      }
    });

    if (attendanceFailedRequests.length > 0) {
      setForceConfirm({ requests: attendanceFailedRequests });
      return;
    }

    if (otherErrorCount > 0) {
      toastError('기수 변경에 실패했습니다.');
      return;
    }

    toastSuccess('기수가 변경되었습니다.');
  };

  const submitCardinalsChange = async (
    clubMemberIds: number[],
    cardinalIds: number[],
    force = false,
  ) => {
    const requests = clubMemberIds.map((clubMemberId) => ({ clubMemberId, cardinalIds }));
    await submitCardinalChangeRequests(requests, force);
  };

  const submitChangeRole = (clubMemberIds: number[], memberRole: ClubMemberRole) =>
    runBulkMutation(
      clubMemberIds.map((clubMemberId) => ({ clubMemberId, memberRole })),
      changeMemberRoleAsync,
      { success: '권한이 변경되었습니다.', error: '권한 변경에 실패했습니다.' },
      (errors) => {
        const isLeadTransferOnly = errors.some(
          (err) => getApiErrorCode(err) === MEMBER_ROLE_ERROR_CODE.LEAD_TRANSFER_ONLY,
        );
        return isLeadTransferOnly ? '리더는 이양을 통해서만 변경할 수 있습니다.' : undefined;
      },
    );

  const submitBan = (clubMemberIds: number[]) =>
    runBulkMutation(clubMemberIds, banMemberAsync, {
      success: '추방되었습니다.',
      error: '추방에 실패했습니다.',
    });

  const submitRestore = (clubMemberIds: number[]) =>
    runBulkMutation(clubMemberIds, restoreMemberAsync, {
      success: '복구되었습니다.',
      error: '복구에 실패했습니다.',
    });

  const handleChangeCardinalsForBulk = (cardinalIds: number[], cardinalNumbers: number[]) => {
    const requests = createBulkCardinalChangeRequests({
      selectedMembers,
      selectedMemberCardinals,
      selectedCardinalNumbers: cardinalNumbers,
      cardinals,
    });

    submitCardinalChangeRequests(requests);
  };

  const handleTransferLead = (clubMemberId: number) => {
    if (!isLead) return;

    transferLead(clubMemberId, {
      onSuccess: () => toastSuccess('리더로 변경되었습니다.'),
      onError: (err) => {
        if (getApiErrorCode(err) === MEMBER_ROLE_ERROR_CODE.ONLY_LEAD_CAN_TRANSFER) {
          toastError('리더만 권한을 이양할 수 있습니다.');
        } else {
          toastError('리더 변경에 실패했습니다.');
        }
      },
    });
  };

  const handleForceConfirm = () => {
    if (!forceConfirm) return;
    const { requests } = forceConfirm;
    setForceConfirm(null);
    submitCardinalChangeRequests(requests, true);
  };

  return {
    forceConfirm,
    targetRole,
    targetBanAction,
    setForceConfirm,
    submitCardinalsChange,
    submitChangeRole,
    submitBan,
    submitRestore,
    handleChangeCardinalsForBulk,
    handleTransferLead,
    handleForceConfirm,
  };
}

export { useMemberBulkActions };
