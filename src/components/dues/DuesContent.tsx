'use client';

import { useState } from 'react';

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui';
import { CardinalDropdown } from '@/components/common';
import { DuesLeftSection } from '@/components/dues/DuesLeftSection';
import { DuesLeftSectionSkeleton, DuesPageSkeleton } from '@/components/dues/DuesPageSkeleton';
import { DuesTransactionSection } from '@/components/dues/DuesTransactionSection';
import { useDuesCardinals, useDuesMe } from '@/hooks/queries';
import type { DuesTransaction } from '@/types/dues';

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
  const [selectedCardinalId, setSelectedCardinalId] = useState<number | null>(null);
  const { data: cardinals = [], isLoading } = useDuesCardinals();
  const latestCardinal = cardinals.find((cardinal) => cardinal.status === 'IN_PROGRESS');
  const selectedCardinal =
    cardinals.find((cardinal) => cardinal.id === selectedCardinalId) ??
    latestCardinal ??
    cardinals[0];
  const {
    data: dues,
    isLoading: isDuesLoading,
    isError: isDuesError,
  } = useDuesMe(selectedCardinal?.cardinalNumber);

  if (isLoading) {
    return <DuesPageSkeleton />;
  }

  return (
    <main className="max-w-dues mx-auto flex w-full flex-col gap-700 px-450 pt-600 pb-800">
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
        {isDuesLoading ? (
          <DuesLeftSectionSkeleton />
        ) : dues ? (
          <DuesLeftSection dues={dues} />
        ) : (
          <section className="desktop:w-[374px] bg-container-neutral flex w-full flex-col gap-200 rounded-lg p-450">
            <h2 className="typo-sub2 text-text-strong">회비 정보를 불러오지 못했어요.</h2>
            <p className="typo-body2 text-text-alternative">
              {isDuesError
                ? '선택한 기수의 회비 장부가 없거나 아직 공개되지 않았어요.'
                : '다른 기수를 선택해 다시 확인해 주세요.'}
            </p>
          </section>
        )}
        <DuesTransactionSection transactions={MOCK_TRANSACTIONS} />
      </div>
    </main>
  );
}

export { DuesContent };
