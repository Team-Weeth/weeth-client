'use client';

import { useState, type ReactNode } from 'react';

import { useParams } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';

import { Switch } from '@/components/ui';
import { useCardinalSelector } from '@/hooks';
import { useDuesVisibilityToggle } from '@/hooks/admin';
import {
  duesRegistrationStatusQueryOptions,
  useDuesDashboardQuery,
  useDuesPaymentTargetsQuery,
} from '@/hooks/queries/admin';

import { BackButton } from './BackButton';
import { PaymentTargetModal } from './modal/PaymentTargetModal';
import { SettingResultCardGrid } from './setup/components';

const MAX_AVATAR_DISPLAY = 4;

interface SettingSectionProps {
  title: string;
  children: ReactNode;
}

// 흰색 카드 컨테이너 + 리스트 헤더 (총 회비 설정 / 회비 공개 범위 공통 래퍼)
function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <div className="bg-container-neutral flex w-full flex-col rounded-lg shadow-sm">
      <div className="flex h-18 items-center px-600">
        <span className="typo-sub1 text-text-normal">{title}</span>
      </div>
      <div className="px-400 pb-400">{children}</div>
    </div>
  );
}

function DuesSettingPageContent() {
  const { clubId } = useParams<{ clubId: string }>();
  const { activeCardinal } = useCardinalSelector({ autoSelectLatest: true });

  // 대시보드로 accountId를 확보한 뒤 등록 상태·납부 대상 목록을 조회한다.
  const { data: dashboard } = useDuesDashboardQuery(clubId, activeCardinal?.cardinalNumber ?? null);
  const accountId = dashboard?.accountId ?? null;

  const { data: status } = useQuery(duesRegistrationStatusQueryOptions(clubId, accountId));
  const { data: paymentTargets } = useDuesPaymentTargetsQuery(clubId, accountId);

  const [isPaymentTargetModalOpen, setIsPaymentTargetModalOpen] = useState(false);

  const { isPublic, handlePublicChange } = useDuesVisibilityToggle(clubId, accountId);

  const cardinalNumber = activeCardinal?.cardinalNumber ?? 0;

  const targetedMembers = (paymentTargets?.targets.content ?? []).filter(
    (t) => t.targetStatus === 'TARGETED',
  );
  const selectedMemberIds = targetedMembers.map((t) => t.paymentTargetInfo.clubMemberId);
  const displayedAvatars = targetedMembers.slice(0, MAX_AVATAR_DISPLAY);
  const remainingCount = Math.max(0, targetedMembers.length - MAX_AVATAR_DISPLAY);

  const hasPreviousBalance = status?.previousAccountBalance != null;

  return (
    <div className="tablet:p-700 flex min-w-85 flex-col gap-700 p-400">
      {/* 헤더 */}
      <div className="flex flex-col gap-300">
        <BackButton />
        <h1 className="typo-h2 text-text-strong">회비 관리 설정</h1>
      </div>

      <div className="flex flex-col gap-400">
        <SettingSection title="총 회비 설정">
          <SettingResultCardGrid
            cardinalNumber={cardinalNumber}
            amount={status?.basic ? String(status.basic.duesAmount) : '0'}
            name={status?.basic?.name ?? ''}
            selectedCount={status?.paymentTargets?.targetCount ?? 0}
            excludedCount={status?.paymentTargets?.excludedCount ?? 0}
            displayedAvatars={displayedAvatars}
            remainingCount={remainingCount}
            onOpenPaymentTargetModal={() => setIsPaymentTargetModalOpen(true)}
            hasPreviousBalance={hasPreviousBalance}
            previousGeneration={status?.previousAccountBalance?.cardinalNumber ?? cardinalNumber - 1}
            previousBalance={status?.previousAccountBalance?.balance ?? 0}
            carryOverOption={status?.carryOver?.enabled ? 'carry' : 'none'}
            carryOverDescription={status?.carryOver?.memo ?? undefined}
            isAccountPublic={status?.bankAccount?.bankAccountVisible ?? false}
            accountNumber={status?.bankAccount?.bankAccount?.accountNumber ?? undefined}
            bankName={status?.bankAccount?.bankAccount?.bankName ?? undefined}
            accountHolder={status?.bankAccount?.bankAccount?.holder ?? undefined}
            accountGuide={status?.bankAccount?.bankAccount?.guide ?? undefined}
          />
        </SettingSection>

        <SettingSection title="회비 공개 범위">
          <div className="bg-container-neutral flex items-center justify-between rounded-lg p-400">
            <div className="flex flex-col gap-100">
              <span className="typo-sub2 text-text-strong">전체 회비 내역 공개</span>
              <span className="typo-body2 text-text-alternative">
                부원이 회비 사용 내역을 볼 수 있어요
              </span>
            </div>
            <Switch checked={isPublic} onCheckedChange={handlePublicChange} />
          </div>
        </SettingSection>
      </div>

      <PaymentTargetModal
        open={isPaymentTargetModalOpen}
        onOpenChange={setIsPaymentTargetModalOpen}
        selectedMemberIds={selectedMemberIds}
      />
    </div>
  );
}

export { DuesSettingPageContent };
