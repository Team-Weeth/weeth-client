'use client';

import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useSavePositionOptions } from '@/hooks/mutations/admin/useAdminPositionMutations';
import { useAdminPositionOptions } from '@/hooks/queries/admin/useAdminPositionQueries';
import { toastSuccess } from '@/stores/useToastStore';
import { MemberPositionContent } from './MemberPositionContent';

function MemberPositionPageContent() {
  const { data: options, isPending, isError, refetch } = useAdminPositionOptions();
  const { mutateAsync: savePositions } = useSavePositionOptions();

  // 편집기는 조회 결과를 초기값으로만 읽으므로, 목록이 도착한 뒤에 렌더한다.
  if (isPending) {
    return (
      <MemberPositionPagePlaceholder>
        <Loading />
      </MemberPositionPagePlaceholder>
    );
  }

  if (isError) {
    return (
      <MemberPositionPagePlaceholder>
        <p className="typo-body1 text-text-alternative">포지션을 불러오지 못했습니다.</p>
        <Button variant="secondary" size="md" onClick={() => refetch()}>
          다시 시도
        </Button>
      </MemberPositionPagePlaceholder>
    );
  }

  return (
    <MemberPositionContent
      // 옵션이 없는 동아리는 편집기 기본값(빈 옵션 4개)으로 시작한다.
      initialOptions={options.length > 0 ? options : undefined}
      onSave={async (payload) => {
        await savePositions(payload);
        toastSuccess('포지션이 저장되었습니다.');
      }}
    />
  );
}

function MemberPositionPagePlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-container-neutral flex min-h-full flex-col items-center justify-center gap-400 rounded-t-lg p-700">
      {children}
    </div>
  );
}

export { MemberPositionPageContent };
