import type { ReactNode } from 'react';

import { Skeleton } from '@/components/ui';

import { DuesSetupStepIndicator } from './DuesSetupStepIndicator';

/** 각 스텝 공통 골격: 헤더 + 스텝 인디케이터 + 본문 + 하단 네비게이션 자리 */
function SetupStepScaffold({
  currentStep,
  children,
  withPrev = true,
}: {
  currentStep: number;
  children: ReactNode;
  withPrev?: boolean;
}) {
  return (
    <div className="flex min-w-85 flex-col gap-700 p-700">
      {/* 헤더 (SetupHeader) */}
      <div className="flex flex-col gap-300">
        <Skeleton className="size-[34px] rounded-sm" />
        <Skeleton className="h-9 w-52" />
      </div>

      <div className="flex flex-col gap-600">
        <DuesSetupStepIndicator currentStep={currentStep} />
        {children}
      </div>

      {/* 하단 네비게이션 */}
      <div className={withPrev ? 'flex items-center justify-between' : 'flex justify-end'}>
        {withPrev && <Skeleton className="h-11 w-24 rounded-md" />}
        <Skeleton className="h-11 w-28 rounded-md" />
      </div>
    </div>
  );
}

/** FormCard 골격: 섹션 헤더(캡션 + 타이틀) + 본문 */
function FormCardSkeleton({ children }: { children: ReactNode }) {
  return (
    <div className="bg-container-neutral flex flex-col gap-400 rounded-lg px-400 py-450">
      <div className="flex flex-col gap-200">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-64" />
      </div>
      {children}
    </div>
  );
}

/** 라벨 + 입력창 한 쌍 */
function FieldSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Skeleton className="mb-200 h-4 w-24" />
      <Skeleton className="h-12 w-full rounded-md" />
    </div>
  );
}

/** Step1 — 기본 정보 */
function DuesSetupStep1Skeleton() {
  return (
    <SetupStepScaffold currentStep={1} withPrev={false}>
      <FormCardSkeleton>
        <div className="flex gap-400">
          <FieldSkeleton className="flex-1" />
          <FieldSkeleton className="flex-1" />
        </div>
        <FieldSkeleton />
      </FormCardSkeleton>
    </SetupStepScaffold>
  );
}

/** Step2 — 납부 대상 */
function DuesSetupStep2Skeleton() {
  return (
    <SetupStepScaffold currentStep={2}>
      <div className="bg-container-neutral flex flex-col gap-600 rounded-lg px-400 py-450">
        <div className="flex flex-col gap-200">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-72" />
        </div>

        <div className="flex flex-col gap-400">
          {/* 탭 */}
          <div className="flex items-center gap-200">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-20 rounded-[10px]" />
            ))}
          </div>
          {/* 검색바 */}
          <Skeleton className="h-11 w-full rounded-md" />
        </div>

        {/* 멤버 테이블 */}
        <div className="border-line flex flex-col overflow-hidden rounded-sm border">
          <Skeleton className="h-12 w-full rounded-none" />
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="border-line flex items-center gap-400 border-t px-400 py-300"
            >
              <Skeleton className="size-5 shrink-0 rounded-sm" />
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-5 w-20 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </SetupStepScaffold>
  );
}

/** Step3 — 이월 설정 */
function DuesSetupStep3Skeleton() {
  return (
    <SetupStepScaffold currentStep={3}>
      <FormCardSkeleton>
        {/* 이전 기수 잔액 카드 */}
        <div className="bg-container-primary-alternative flex flex-col gap-100 rounded-lg px-400 py-300">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-40" />
        </div>

        {/* 이월 옵션 카드 2개 */}
        <div className="flex gap-400">
          {Array.from({ length: 2 }, (_, i) => (
            <Skeleton key={i} className="h-24 flex-1 rounded-lg" />
          ))}
        </div>
      </FormCardSkeleton>
    </SetupStepScaffold>
  );
}

/** Step4 — 계좌 공개 */
function DuesSetupStep4Skeleton() {
  return (
    <SetupStepScaffold currentStep={4}>
      <FormCardSkeleton>
        <div className="grid grid-cols-2 gap-400">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
        <div className="grid grid-cols-2 gap-400">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
        {/* 계좌 공개 토글 */}
        <div className="border-line flex items-center justify-between rounded-lg border p-400">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-11 rounded-full" />
        </div>
      </FormCardSkeleton>
    </SetupStepScaffold>
  );
}

/** Step5 — 최종 확인 */
function DuesSetupStep5Skeleton() {
  return (
    <SetupStepScaffold currentStep={5}>
      <FormCardSkeleton>
        {/* 예상 관리 금액 배너 */}
        <div className="bg-container-primary-alternative flex items-center justify-between rounded-lg px-500 py-400">
          <div className="flex flex-col gap-100">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-40" />
          </div>
          <div className="flex flex-col items-end gap-200">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>

        {/* 정보 카드 2×2 그리드 */}
        <div className="grid grid-cols-2 gap-400">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </FormCardSkeleton>
    </SetupStepScaffold>
  );
}

export {
  DuesSetupStep1Skeleton,
  DuesSetupStep2Skeleton,
  DuesSetupStep3Skeleton,
  DuesSetupStep4Skeleton,
  DuesSetupStep5Skeleton,
};
