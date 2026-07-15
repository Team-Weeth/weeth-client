import { Card, Skeleton } from '@/components/ui';

// SettingSection(흰색 카드 + 헤더) 골격
function SettingSectionSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-container-neutral flex w-full flex-col rounded-lg shadow-sm">
      <div className="flex h-18 items-center px-600">
        <Skeleton className="h-6 w-28" />
      </div>
      <div className="px-400 pb-400">{children}</div>
    </div>
  );
}

// InfoCard(제목 + 정보 행 3개) 골격
function InfoCardSkeleton() {
  return (
    <Card className="shadow-none">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="size-[26px] rounded-sm" />
      </div>
      <div className="flex flex-col gap-200">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="grid grid-cols-[2fr_3fr] gap-300">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function DuesSettingPageSkeleton() {
  return (
    <div className="tablet:p-700 flex min-w-85 flex-col gap-700 p-400">
      {/* 헤더 */}
      <div className="flex flex-col gap-300">
        <Skeleton className="size-[34px] rounded-sm" />
        <Skeleton className="h-9 w-52" />
      </div>

      <div className="flex flex-col gap-400">
        {/* 총 회비 설정 */}
        <SettingSectionSkeleton>
          <div className="tablet:grid tablet:grid-cols-2 flex flex-col gap-400">
            {Array.from({ length: 4 }, (_, index) => (
              <InfoCardSkeleton key={index} />
            ))}
          </div>
        </SettingSectionSkeleton>

        {/* 회비 공개 범위 */}
        <SettingSectionSkeleton>
          <div className="bg-container-neutral flex items-center justify-between rounded-lg p-400">
            <div className="flex flex-col gap-100">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-5 w-52" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        </SettingSectionSkeleton>
      </div>
    </div>
  );
}

export { DuesSettingPageSkeleton };
