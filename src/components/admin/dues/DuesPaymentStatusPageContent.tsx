'use client';

import { useParams, useRouter } from 'next/navigation';

import { BackIcon, CopyIcon } from '@/assets/icons';
import { Card, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { toastSuccess } from '@/stores/useToastStore';
import { useCardinalSelector } from '@/hooks';

import { DuesMemberPaymentTable, type DuesMember } from './DuesMemberPaymentTable';
import { DuesPaymentSummaryCard } from './DuesPaymentSummaryCard';

const MOCK_MEMBERS: DuesMember[] = [
  { id: 1, name: '김위드', major: '경영학과', phone: '010-1234-1234', status: 'unpaid' },
  { id: 2, name: '이위드', major: '컴퓨터공학과', phone: '010-2345-2345', status: 'paid' },
  { id: 3, name: '박위드', major: '소프트웨어학과', phone: '010-3456-3456', status: 'paid' },
  { id: 4, name: '최위드', major: '전자공학과', phone: '010-4567-4567', status: 'unpaid' },
  { id: 5, name: '정위드', major: '경영학과', phone: '010-5678-5678', status: 'paid' },
  { id: 6, name: '강위드', major: '컴퓨터공학과', phone: '010-6789-6789', status: 'unpaid' },
  { id: 7, name: '조위드', major: '소프트웨어학과', phone: '010-7890-7890', status: 'paid' },
  { id: 8, name: '윤위드', major: '전자공학과', phone: '010-8901-8901', status: 'paid' },
];

const MOCK_ACCOUNT = {
  bankName: '국민은행',
  accountNumber: '12-12412-1231',
  holderName: '가천대oo부',
  isPublic: true,
};

const MOCK_TOTAL_COLLECTED = 1300000;
const MOCK_TOTAL_TARGET = 1390000;

interface StatCardProps {
  label: string;
  value: string;
  action: string;
  onAction?: () => void;
  className?: string;
}

function StatCard({ label, value, action, onAction, className }: StatCardProps) {
  return (
    <Card
      className={cn(
        'flex flex-1 flex-row items-center justify-between px-400 py-300',
        className,
      )}
    >
      <div className="flex flex-col gap-100">
        <span className="typo-sub3 text-text-normal">{value}</span>
        <span className="typo-caption2 text-text-alternative">{label}</span>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="bg-button-neutral typo-button2 text-text-strong hover:bg-container-neutral-interaction ml-300 shrink-0 cursor-pointer rounded-sm px-300 py-200 transition-colors"
      >
        {action}
      </button>
    </Card>
  );
}

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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullText);
    toastSuccess('계좌번호가 복사되었습니다.');
  };

  return (
    <Card
      className={cn(
        'flex flex-1 flex-row items-center justify-between px-400 py-300',
        className,
      )}
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
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const { activeCardinal } = useCardinalSelector({ autoSelectLatest: true });

  const unpaidCount = MOCK_MEMBERS.filter((m) => m.status === 'unpaid').length;
  const totalCount = MOCK_MEMBERS.length;

  const generationLabel = activeCardinal ? `${activeCardinal.cardinalNumber}기` : '';

  return (
    <div className="tablet:p-700 flex min-w-[340px] flex-col gap-700 p-400">
      {/* 헤더 */}
      <div className="flex flex-col gap-400">
        <button
          type="button"
          onClick={() => router.push(`/${clubId}/admin/dues`)}
          aria-label="뒤로가기"
          className="bg-button-neutral hover:bg-container-neutral-interaction w-fit cursor-pointer rounded-sm p-200 transition-colors"
        >
          <Icon src={BackIcon} alt="뒤로가기" size={24} />
        </button>
        <h1 className="text-text-strong text-[28px] leading-[36px] font-bold tracking-[-0.14px]">
          {generationLabel} 회비 납부 현황
        </h1>
      </div>

      {/* 상단 섹션 */}
      <div className="flex flex-wrap items-stretch gap-600">
        <DuesPaymentSummaryCard
          totalCollected={MOCK_TOTAL_COLLECTED}
          totalTarget={MOCK_TOTAL_TARGET}
        />
        <div className="flex w-full flex-col gap-400 tablet:w-[339px]">
          <StatCard label="미납 인원" value={`${unpaidCount}명`} action="현황 업데이트" />
          <StatCard label="납부 대상" value={`${totalCount}명`} action="수정" />
          <AccountCard {...MOCK_ACCOUNT} />
        </div>
      </div>

      {/* 부원별 납부현황 테이블 */}
      <DuesMemberPaymentTable
        members={MOCK_MEMBERS}
        onViewMember={(member) => {
          router.push(`/${clubId}/admin/member?name=${encodeURIComponent(member.name)}`);
        }}
      />
    </div>
  );
}

export { DuesPaymentStatusPageContent };
