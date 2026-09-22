'use client';

import { MemberPositionContent } from '@/components/admin/member/MemberPositionContent';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useSavePositionOptions } from '@/hooks/mutations/admin/useAdminPositionMutations';
import { useAdminPositionOptions } from '@/hooks/queries/admin/useAdminPositionQueries';
import { toastSuccess } from '@/stores/useToastStore';

export default function PositionSettingsPage() {
  const { data: options, isPending, isError, refetch } = useAdminPositionOptions();
  const { mutateAsync: savePositions } = useSavePositionOptions();

  if (isPending) {
    return (
      <div className="bg-container-neutral flex min-h-full items-center justify-center rounded-t-lg p-700">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-container-neutral flex min-h-full flex-col items-center justify-center gap-400 rounded-t-lg p-700">
        <p className="typo-body1 text-text-alternative">포지션을 불러오지 못했습니다.</p>
        <Button variant="secondary" size="md" onClick={() => refetch()}>
          다시 시도
        </Button>
      </div>
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
