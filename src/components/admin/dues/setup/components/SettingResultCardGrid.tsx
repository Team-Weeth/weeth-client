import type { ReactNode } from 'react';

import { EditIcon } from '@/assets/icons';
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, Card, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatAmount } from '@/lib/formatAmount';

interface InfoRowProps {
  label: string;
  value: string;
  valueClassName?: string;
}

function InfoRow({ label, value, valueClassName }: InfoRowProps) {
  return (
    <div className="grid grid-cols-[2fr_3fr] gap-300">
      <span className="typo-sub3 text-text-alternative">{label}</span>
      <span className={cn('typo-sub3 text-text-alternative', valueClassName)}>{value}</span>
    </div>
  );
}

interface InfoCardProps {
  title: string;
  onEdit?: () => void;
  children: ReactNode;
}

function InfoCard({ title, onEdit, children }: InfoCardProps) {
  return (
    <Card className="shadow-none">
      <div className="flex items-center justify-between">
        <span className="typo-sub1 text-text-normal">{title}</span>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="bg-button-neutral text-icon-alternative hover:text-icon-normal flex cursor-pointer self-center rounded-sm p-1 transition-colors"
            aria-label={`${title} 수정`}
          >
            <Icon src={EditIcon} alt="" size={18} />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-200">{children}</div>
    </Card>
  );
}

interface PaymentTargetAvatar {
  paymentTargetInfo: {
    clubMemberId: number;
    name: string;
  };
}

interface SettingResultCardGridProps {
  // Step 1: 기본 정보
  cardinalNumber: number;
  amount: string;
  name: string;
  // Step 2: 납부 대상
  selectedCount: number;
  excludedCount: number;
  displayedAvatars: PaymentTargetAvatar[];
  remainingCount: number;
  onOpenPaymentTargetModal: () => void;
  // Step 3: 이월 설정
  hasPreviousBalance: boolean;
  previousGeneration: number;
  previousBalance: number;
  carryOverOption: 'none' | 'carry';
  carryOverAmount?: string;
  // Step 4: 계좌 공개
  isAccountPublic: boolean;
  accountNumber?: string;
  bankName?: string;
  accountHolder?: string;
  accountGuide?: string;
  // 편집 버튼 → 해당 스텝으로 이동 (최종 확인으로 복귀하도록 returnStep을 설정한다)
  // 미전달 시 각 카드의 수정 버튼을 노출하지 않는다.
  onEditStep?: (step: number) => void;
}

function SettingResultCardGrid({
  cardinalNumber,
  amount,
  name,
  selectedCount,
  excludedCount,
  displayedAvatars,
  remainingCount,
  onOpenPaymentTargetModal,
  hasPreviousBalance,
  previousGeneration,
  previousBalance,
  carryOverOption,
  carryOverAmount,
  isAccountPublic,
  accountNumber,
  bankName,
  accountHolder,
  accountGuide,
  onEditStep,
}: SettingResultCardGridProps) {
  return (
    <div className="tablet:grid tablet:grid-cols-2 flex flex-col gap-400">
      {/* 기본 정보 */}
      <InfoCard title="기본 정보" onEdit={onEditStep ? () => onEditStep(1) : undefined}>
        <InfoRow label="기수" value={`${cardinalNumber} 기`} />
        <InfoRow label="회비 이름" value={name || '-'} />
        <InfoRow label="1인 회비" value={`${formatAmount(Number(amount))} 원`} />
      </InfoCard>

      {/* 이월 설정 */}
      <InfoCard title="이월 설정" onEdit={onEditStep ? () => onEditStep(3) : undefined}>
        <InfoRow
          label="이전 기수"
          value={hasPreviousBalance ? `${previousGeneration} 기` : '없음'}
        />
        <InfoRow label="이월 여부" value={carryOverOption === 'carry' ? '이월함' : '이월 안 함'} />
        {carryOverOption === 'carry' && (
          <InfoRow
            label="이월 금액"
            value={`${formatAmount(hasPreviousBalance ? previousBalance : Number(carryOverAmount))} 원`}
          />
        )}
      </InfoCard>

      {/* 납부 대상 */}
      <InfoCard title="납부 대상" onEdit={onEditStep ? () => onEditStep(2) : undefined}>
        <InfoRow label="납부 대상" value={`${selectedCount} 명`} />
        <InfoRow label="제외 대상" value={`${excludedCount} 명`} />
        <div className="grid grid-cols-[2fr_3fr] gap-200">
          <span className="typo-sub3 text-text-alternative">선택 멤버</span>
          <button type="button" onClick={onOpenPaymentTargetModal} className="cursor-pointer">
            <AvatarGroup>
              {displayedAvatars.map((t) => (
                <Avatar key={t.paymentTargetInfo.clubMemberId} size={24} colorScheme="primary">
                  <AvatarFallback>{t.paymentTargetInfo.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              {remainingCount > 0 && (
                <AvatarGroupCount className="size-6 text-xs">+{remainingCount}</AvatarGroupCount>
              )}
            </AvatarGroup>
          </button>
        </div>
      </InfoCard>

      {/* 계좌 공개 */}
      <InfoCard title="계좌 공개" onEdit={onEditStep ? () => onEditStep(4) : undefined}>
        <InfoRow label="계좌 공개" value={isAccountPublic ? '공개함' : '비공개'} />
        {bankName && <InfoRow label="은행" value={bankName} />}
        {accountNumber && (
          <InfoRow label="계좌번호" value={accountNumber} valueClassName="truncate" />
        )}
        {accountHolder && <InfoRow label="예금주" value={accountHolder} />}
        {accountGuide && <InfoRow label="안내 문구" value={accountGuide} />}
      </InfoCard>
    </div>
  );
}

export {
  InfoRow,
  InfoCard,
  SettingResultCardGrid,
  type InfoRowProps,
  type InfoCardProps,
  type SettingResultCardGridProps,
};
