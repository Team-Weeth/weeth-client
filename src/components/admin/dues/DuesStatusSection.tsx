'use client';

import CopyIcon from '@/assets/icons/copy.svg';
import {
  Card,
  Icon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { toastSuccess } from '@/stores/useToastStore';

interface PaymentStatusCardProps {
  paidCount: number;
  totalCount: number;
  onViewDetail?: () => void;
}

function PaymentStatusCard({ paidCount, totalCount, onViewDetail }: PaymentStatusCardProps) {
  return (
    <Card className="flex flex-row items-center justify-between p-400 shadow-none">
      <div className="flex flex-col gap-100">
        <span className="typo-sub3 text-text-normal">
          {paidCount}명 / {totalCount}명
        </span>
        <span className="typo-caption2 text-text-alternative">회비 납부 현황</span>
      </div>
      <button
        type="button"
        onClick={onViewDetail}
        className="bg-button-neutral typo-button2 text-text-strong hover:bg-container-neutral-interaction cursor-pointer rounded-sm px-300 py-200"
      >
        조회
      </button>
    </Card>
  );
}

interface AccountInfoCardProps {
  bankName: string;
  accountNumber: string;
  holderName: string;
  isPublic: boolean;
  onCopy?: () => void;
}

function AccountInfoCard({
  bankName,
  accountNumber,
  holderName,
  isPublic,
  onCopy,
}: AccountInfoCardProps) {
  const fullText = `${bankName} ${accountNumber} ${holderName}`;
  const isOverflow = fullText.length > 20;
  const displayText = isOverflow ? `${fullText.slice(0, 20)}...` : fullText;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullText);
    toastSuccess('계좌번호가 복사되었습니다.');
    onCopy?.();
  };

  return (
    <Card className="flex flex-row items-center justify-between p-400 shadow-none">
      <div className="flex min-w-0 flex-col gap-100">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="typo-sub3 text-text-normal">{displayText}</span>
            </TooltipTrigger>
            {isOverflow && <TooltipContent variant="sm">{fullText}</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
        <span className="typo-caption2 text-text-alternative overflow-hidden whitespace-nowrap">
          회비 계좌 정보 ({isPublic ? '공개 중' : '비공개'})
        </span>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="계좌번호 복사"
        className="text-icon-alternative hover:text-icon-strong ml-300 shrink-0 cursor-pointer"
      >
        <Icon src={CopyIcon} size={20} />
      </button>
    </Card>
  );
}

interface DuesStatusSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  paidCount: number;
  totalCount: number;
  bankName: string;
  accountNumber: string;
  holderName: string;
  isAccountPublic: boolean;
  onViewPaymentDetail?: () => void;
  onCopyAccount?: () => void;
}

function DuesStatusSection({
  className,
  paidCount,
  totalCount,
  bankName,
  accountNumber,
  holderName,
  isAccountPublic,
  onViewPaymentDetail,
  onCopyAccount,
  ...props
}: DuesStatusSectionProps) {
  return (
    <div className={cn('flex flex-col gap-300', className)} {...props}>
      <PaymentStatusCard
        paidCount={paidCount}
        totalCount={totalCount}
        onViewDetail={onViewPaymentDetail}
      />
      <AccountInfoCard
        bankName={bankName}
        accountNumber={accountNumber}
        holderName={holderName}
        isPublic={isAccountPublic}
        onCopy={onCopyAccount}
      />
    </div>
  );
}

export { DuesStatusSection, type DuesStatusSectionProps };
