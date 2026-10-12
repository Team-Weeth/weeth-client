'use client';

import CopyIcon from '@/assets/icons/copy.svg';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { copyDuesAccountToClipboard } from '@/utils/dues/duesAccount';

// TODO: 회비 메인 UI(DuesStatusSection의 AccountInfoCard)와 시각 사양이 합의되면 하나로 통합하기
interface DuesPaymentAccountCardProps {
  bankName: string;
  accountNumber: string;
  holderName: string;
  isPublic: boolean;
  className?: string;
}

function DuesPaymentAccountCard({
  bankName,
  accountNumber,
  holderName,
  isPublic,
  className,
}: DuesPaymentAccountCardProps) {
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

export { DuesPaymentAccountCard, type DuesPaymentAccountCardProps };
