'use client';

import { useState } from 'react';

import { useParams } from 'next/navigation';

import { CopyIcon } from '@/assets/icons';
import { Card, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import { copyDuesAccountToClipboard } from '@/utils/dues/duesAccount';
import { useCardinalSelector } from '@/hooks';
import { useDuesDashboardQuery, useDuesPaymentTargetsQuery } from '@/hooks/queries/admin';
import {
  useExcludePaymentTargets,
  useMarkPaymentTargetsPaid,
  useMarkPaymentTargetsUnpaid,
  useRefundPaymentTargets,
} from '@/hooks/mutations/admin/useAdminDuesMutations';
import type { PaymentTarget } from '@/types/admin/dues';

import { DuesMemberPaymentTable, type DuesMember } from './DuesMemberPaymentTable';
import { DuesPaymentSummaryCard } from './DuesPaymentSummaryCard';
import { BackButton } from './BackButton';
import { MemberSelectHeader } from './MemberSelectHeader';

// PaymentTarget의 targetStatus/paymentStatus를 테이블 행 표시 상태로 합친다.
// EXCLUDED(제외)면 납부 상태와 무관하게 'excluded', 그 외에는 납부 상태를 그대로 매핑한다.
function toMemberStatus(target: PaymentTarget): DuesMember['status'] {
  if (target.targetStatus === 'EXCLUDED') return 'excluded';
  if (target.paymentStatus === 'PAID') return 'paid';
  if (target.paymentStatus === 'REFUNDED') return 'refunded';
  return 'unpaid';
}

// 납부 대상(PaymentTarget) → 테이블이 쓰는 DuesMember 형태로 변환
function toDuesMember(target: PaymentTarget): DuesMember {
  const { paymentTargetInfo } = target;
  return {
    id: paymentTargetInfo.clubMemberId,
    name: paymentTargetInfo.name,
    major: paymentTargetInfo.department,
    phone: paymentTargetInfo.tel,
    status: toMemberStatus(target),
  };
}

// 서버가 요구하는 'YYYY-MM-DDTHH:mm:ss'(로컬 시각) 포맷으로 현재 시각을 만든다.
function nowLocalDateTime(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

interface StatCardProps {
  label: string;
  value: string;
  className?: string;
}

function StatCard({ label, value, className }: StatCardProps) {
  return (
    <Card
      className={cn('flex flex-1 flex-row items-center justify-between px-400 py-300', className)}
    >
      <div className="flex flex-col gap-100">
        <span className="typo-sub3 text-text-normal">{value}</span>
        <span className="typo-caption2 text-text-alternative">{label}</span>
      </div>
    </Card>
  );
}

//TODO: 회비 메인 UI 머지되면 거기서 쓰이는 컴포넌트 추출해서 재사용하기
interface AccountCardProps {
  bankName: string;
  accountNumber: string;
  holderName: string;
  isPublic: boolean;
  className?: string;
}

function AccountCard({
  bankName,
  accountNumber,
  holderName,
  isPublic,
  className,
}: AccountCardProps) {
  const fullText = `${bankName} ${accountNumber} ${holderName}`;

  const handleCopy = () =>
    copyDuesAccountToClipboard(
      { bankName, accountNumber, holderName },
      {
        successMessage: '계좌번호가 복사되었습니다.',
        errorMessage: '복사에 실패했습니다. 직접 선택해서 복사해 주세요.',
      },
    );

  return (
    <Card
      className={cn('flex flex-1 flex-row items-center justify-between px-400 py-300', className)}
    >
      <div className="flex min-w-0 flex-col gap-100">
        <span className="typo-sub3 text-text-normal truncate">{fullText}</span>
        <span className="typo-caption2 text-text-alternative">
          회비 계좌 정보 ({isPublic ? '공개 중' : '비공개'})
        </span>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="계좌번호 복사"
        className="text-icon-alternative hover:text-icon-strong ml-300 shrink-0 cursor-pointer transition-colors"
      >
        <Icon src={CopyIcon} size={20} />
      </button>
    </Card>
  );
}

function DuesPaymentStatusPageContent() {
  const { clubId } = useParams<{ clubId: string }>();
  const { activeCardinal } = useCardinalSelector({ autoSelectLatest: true, scope: 'dues' });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 대시보드로 accountId·계좌 정보를 확보한 뒤 납부 대상 목록을 조회한다.
  const { data: dashboard } = useDuesDashboardQuery(clubId, activeCardinal?.cardinalNumber ?? null);
  const { data: paymentTargets } = useDuesPaymentTargetsQuery(clubId, dashboard?.accountId ?? null);

  // 테이블에는 제외(EXCLUDED) 부원까지 모두 노출하되, 집계는 실제 납부 대상(TARGETED)만 사용한다.
  const allTargets = paymentTargets?.targets.content ?? [];
  const targeted = allTargets.filter((t) => t.targetStatus === 'TARGETED');
  const members: DuesMember[] = allTargets.map(toDuesMember);
  const totalTarget = targeted.reduce((sum, t) => sum + t.dueAmount, 0);
  const totalCollected = targeted.reduce((sum, t) => sum + t.paidAmount, 0);

  const account = dashboard?.bankAccount;

  const unpaidCount = targeted.filter((t) => t.paymentStatus === 'UNPAID').length;
  const totalCount = targeted.length;

  const generationLabel = activeCardinal ? `${activeCardinal.cardinalNumber}기` : '';

  // 선택 상태(selectedIds)는 clubMemberId를 담고 있으나, 벌크 API는 targetId를 요구한다.
  const targetIdByMemberId = new Map(
    targeted.map((t) => [t.paymentTargetInfo.clubMemberId, t.targetId]),
  );
  const selectedTargetIds = () =>
    [...selectedIds]
      .map((memberId) => targetIdByMemberId.get(memberId))
      .filter((id): id is number => id !== undefined);

  const clearSelection = () => setSelectedIds(new Set());
  const accountId = dashboard?.accountId ?? null;

  // 선택은 동일 상태로만 이루어지므로, 첫 선택 멤버의 상태가 곧 선택 상태다.
  const selectedStatus =
    selectedIds.size === 0 ? null : (members.find((m) => selectedIds.has(m.id))?.status ?? null);

  const { mutate: markUnpaid } = useMarkPaymentTargetsUnpaid(clubId, accountId, {
    onSuccess: () => {
      toastSuccess('납부가 정정되었습니다.');
      clearSelection();
    },
    onError: () => toastError('납부 정정에 실패했습니다.'),
  });

  const { mutate: refund } = useRefundPaymentTargets(clubId, accountId, {
    onSuccess: () => {
      toastSuccess('환불 처리되었습니다.');
      clearSelection();
    },
    onError: () => toastError('환불 처리에 실패했습니다.'),
  });

  const { mutate: markPaid } = useMarkPaymentTargetsPaid(clubId, accountId, {
    onSuccess: () => {
      toastSuccess('납부가 확인되었습니다.');
      clearSelection();
    },
    onError: () => toastError('납부 확인에 실패했습니다.'),
  });

  const { mutate: exclude } = useExcludePaymentTargets(clubId, accountId, {
    onSuccess: () => {
      toastSuccess('납부 대상에서 제외되었습니다.');
      clearSelection();
    },
    onError: () => toastError('제외 처리에 실패했습니다.'),
  });

  return (
    <div className="flex min-w-85 flex-col">
      {/* Selection top bar — sticky top-0 z-10 -mt-15 로 Header 영역에 오버레이 */}
      {selectedStatus !== null && (
        <MemberSelectHeader
          selectedCount={selectedIds.size}
          selectedStatus={selectedStatus}
          onClear={clearSelection}
          onMarkUnpaid={() => markUnpaid({ targetIds: selectedTargetIds() })}
          onRefund={() => refund({ targetIds: selectedTargetIds(), memo: '' })}
          onMarkPaid={() =>
            markPaid({ targetIds: selectedTargetIds(), paidAt: nowLocalDateTime(), memo: '' })
          }
          onExclude={() => exclude({ targetIds: selectedTargetIds() })}
        />
      )}

      <div className="tablet:p-700 flex flex-col gap-700 p-400">
        {/* 헤더 */}
        <div className="flex flex-col gap-400">
          <BackButton />
          <h1 className="text-text-strong text-[28px] leading-9 font-bold tracking-[-0.14px]">
            {generationLabel} 회비 납부 현황
          </h1>
        </div>

        {/* 상단 섹션 */}
        <div className="flex flex-wrap items-stretch gap-600">
          <DuesPaymentSummaryCard totalCollected={totalCollected} totalTarget={totalTarget} />
          <div className="tablet:w-84.75 flex w-full flex-col gap-400">
            <StatCard label="미납 인원" value={`${unpaidCount}명`} />

            <StatCard label="납부 대상" value={`${totalCount}명`} />
            {account && (
              <AccountCard
                bankName={account.bankName}
                accountNumber={account.accountNumber}
                holderName={account.holder}
                isPublic={dashboard?.bankAccountPublic ?? false}
              />
            )}
          </div>
        </div>

        {/* 부원별 납부현황 테이블 */}
        <DuesMemberPaymentTable
          members={members}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </div>
    </div>
  );
}

export { DuesPaymentStatusPageContent };
