'use client';

import { useParams, useRouter } from 'next/navigation';
import BackIcon from '@/assets/icons/back.svg';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useMemberDetailQuery } from '@/hooks/member/useMemberDetailQuery';
import { MemberDetailBody } from './MemberDetailBody';
import { MemberDetailSkeleton } from './MemberDetailSkeleton';

function MemberDetailContent() {
  const router = useRouter();
  const { clubId, memberId } = useParams<{ clubId: string; memberId: string }>();
  const {
    data: member,
    isPending,
    isError,
    refetch,
  } = useMemberDetailQuery(clubId, Number(memberId));

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 px-450 pt-450 pb-[100px]">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex cursor-pointer items-center justify-center p-1"
        >
          <Icon src={BackIcon} size={21} className="text-icon-normal p-1" />
        </button>
        <h1 className="typo-sub3 text-text-normal">멤버 상세</h1>
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

      <div className="bg-background fixed right-0 bottom-0 left-0 px-450 pt-300 pb-500">
        <Button variant="primary" size="lg" className="w-full" onClick={() => router.back()}>
          완료
        </Button>
      </div>
    </div>
  );
}

export { MemberDetailContent };
