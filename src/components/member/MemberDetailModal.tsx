'use client';

import { useParams } from 'next/navigation';
import DeleteIcon from '@/assets/icons/delete.svg';
import { DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/Icon';
import { useMemberDetailQuery } from '@/hooks/member/useMemberDetailQuery';
import { MemberDetailBody } from './MemberDetailBody';
import { MemberDetailSkeleton } from './MemberDetailSkeleton';

interface MemberDetailModalProps {
  clubMemberId: number;
  open: boolean;
}

function MemberDetailModal({ clubMemberId, open }: MemberDetailModalProps) {
  const { clubId } = useParams<{ clubId: string }>();
  const {
    data: member,
    isPending,
    isError,
    refetch,
  } = useMemberDetailQuery(clubId, clubMemberId, open);

  return (
    <DialogContent
      showCloseButton={false}
      className="bg-background w-full max-w-[min(918px,calc(100%-2rem))] overflow-hidden rounded-lg p-400"
    >
      <div className="flex items-center justify-between gap-300 pb-400">
        <DialogTitle className="typo-sub1 text-text-strong">멤버 상세</DialogTitle>
        <DialogClose className="cursor-pointer">
          <Icon src={DeleteIcon} size={24} className="text-icon-normal" alt="닫기" />
        </DialogClose>
      </div>
      {isPending ? (
        <MemberDetailSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-300 py-800">
          <p className="typo-body1 text-text-alternative">멤버 정보를 불러오지 못했습니다</p>
          <button
            type="button"
            className="typo-button2 text-brand-primary"
            onClick={() => refetch()}
          >
            다시 시도
          </button>
        </div>
      ) : (
        <MemberDetailBody member={member} />
      )}
    </DialogContent>
  );
}

export { MemberDetailModal, type MemberDetailModalProps };
