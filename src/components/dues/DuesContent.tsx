'use client';

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui';
import { CardinalDropdown } from '@/components/common';
import { DuesLeftSection } from '@/components/dues/DuesLeftSection';
import { DuesPageSkeleton } from '@/components/dues/DuesPageSkeleton';
import { DuesTransactionSection } from '@/components/dues/DuesTransactionSection';
import { useCardinalSelector } from '@/hooks';
import type { DuesSummary, DuesTransaction } from '@/types/dues';

const MOCK_DUES: DuesSummary = {
  cardinalNumber: 7,
  duesAmount: 60000,
  currentBalance: 152129,
  targetBalance: 1425000,
  isPaid: false,
  isAccountPublic: true,
  account: {
    bankName: '국민은행',
    accountNumber: '12-12412-1231',
    holderName: '가천대 검도부',
  },
};

const MOCK_TRANSACTIONS: DuesTransaction[] = [
  {
    id: 1,
    type: 'dues',
    title: '4월 회비',
    description: '납부될 때마다 합산돼요',
    amount: 1100000,
    date: '2026-07-20',
  },
  {
    id: 2,
    type: 'income',
    title: '통장 이자',
    description: '은행',
    amount: 27,
    date: '2026-07-20',
  },
  {
    id: 3,
    type: 'expense',
    title: '스터디 지원',
    description: '인프런 외 4곳',
    amount: 123000,
    date: '2026-07-20',
    counterparty: '인프런',
    category: '운영비',
    registrant: '운영진 김검도',
    receiptUrls: ['/mock-receipt.svg', '/mock-receipt.svg', '/mock-receipt.svg'],
    receiptThumbnailUrl: '/mock-receipt.svg',
  },
  {
    id: 4,
    type: 'expense',
    title: '스터디 지원',
    description: '인프런 외 4곳',
    amount: 123000,
    date: '2026-07-20',
    counterparty: '인프런',
    category: '운영비',
    registrant: '운영진 김검도',
  },
  {
    id: 5,
    type: 'expense',
    title: '스터디 지원',
    description: '인프런 외 4곳',
    amount: 123000,
    date: '2026-07-20',
    counterparty: '인프런',
    category: '운영비',
    registrant: '운영진 김검도',
  },
];

function DuesContent() {
  const { cardinals, activeCardinal, latestCardinal, setSelectedCardinalId, isLoading } =
    useCardinalSelector({
      autoSelectLatest: true,
    });

  if (isLoading) {
    return <DuesPageSkeleton />;
  }

  const selectedCardinal = activeCardinal ?? latestCardinal;
  const dues = {
    ...MOCK_DUES,
    cardinalNumber: selectedCardinal?.cardinalNumber ?? MOCK_DUES.cardinalNumber,
  };

  return (
    <main className="mx-auto flex w-full max-w-[1250px] flex-col gap-700 px-450 pt-600 pb-800">
      <div className="flex items-end justify-between gap-400">
        <div className="flex flex-col gap-300">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>회비</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="typo-h2 text-text-strong">회비</h1>
        </div>
        <CardinalDropdown
          cardinals={cardinals}
          activeCardinal={selectedCardinal}
          onSelect={setSelectedCardinalId}
        />
      </div>

      <div className="desktop:flex-row flex flex-col gap-500">
        <DuesLeftSection dues={dues} />
        <DuesTransactionSection transactions={MOCK_TRANSACTIONS} />
      </div>
    </main>
  );
}

export { DuesContent };
