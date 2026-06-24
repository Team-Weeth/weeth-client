'use client';

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui';
import { CardinalDropdown } from '@/components/common';
import { DuesLeftSection } from '@/components/dues/DuesLeftSection';
import { useCardinalSelector } from '@/hooks';
import type { DuesSummary } from '@/types/dues';

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

function DuesContent() {
  const { cardinals, activeCardinal, latestCardinal, setSelectedCardinalId } = useCardinalSelector({
    autoSelectLatest: true,
  });
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
        <section className="bg-container-neutral min-h-[420px] flex-1 rounded-lg p-500">
          <h2 className="typo-sub1 text-text-strong">거래 내역</h2>
        </section>
      </div>
    </main>
  );
}

export { DuesContent };
