'use client';

import { useRef, useState } from 'react';

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui';
import { CardinalDropdown } from '@/components/common';
import { DuesLeftSection } from '@/components/dues/DuesLeftSection';
import {
  DuesLeftSectionSkeleton,
  DuesPageSkeleton,
  DuesTransactionSectionSkeleton,
} from '@/components/dues/DuesPageSkeleton';
import { DuesTransactionSection } from '@/components/dues/DuesTransactionSection';
import { useDuesCardinals, useDuesMe, useDuesTransactions } from '@/hooks/queries';

function DuesContent() {
  const [selectedCardinalId, setSelectedCardinalId] = useState<number | null>(null);
  const [isCardinalTransitioning, setIsCardinalTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: cardinals = [], isLoading } = useDuesCardinals();
  const latestCardinal = cardinals.find((cardinal) => cardinal.status === 'IN_PROGRESS');
  const selectedCardinal =
    cardinals.find((cardinal) => cardinal.id === selectedCardinalId) ??
    latestCardinal ??
    cardinals[0];
  const {
    data: dues,
    isLoading: isDuesLoading,
    isFetching: isDuesFetching,
    isError: isDuesError,
  } = useDuesMe(selectedCardinal?.cardinalNumber);
  const {
    data: transactionData,
    fetchNextPage,
    hasNextPage,
    isLoading: isTransactionsLoading,
    isFetching: isTransactionsFetching,
    isFetchingNextPage,
  } = useDuesTransactions(selectedCardinal?.cardinalNumber);
  const isLeftSectionLoading = isDuesLoading || isDuesFetching || isCardinalTransitioning;
  const isTransactionSectionLoading =
    isTransactionsLoading ||
    (isTransactionsFetching && !isFetchingNextPage) ||
    (isCardinalTransitioning && !isFetchingNextPage);

  const handleSelectCardinal = (cardinalId: number) => {
    if (selectedCardinal?.id === cardinalId) return;

    setSelectedCardinalId(cardinalId);
    setIsCardinalTransitioning(true);

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = setTimeout(() => {
      setIsCardinalTransitioning(false);
    }, 250);
  };

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
          onSelect={handleSelectCardinal}
        />
      </div>

      <div className="desktop:flex-row flex flex-col gap-500">
        {isLeftSectionLoading ? (
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
        {isTransactionSectionLoading ? (
          <DuesTransactionSectionSkeleton />
        ) : (
          <DuesTransactionSection
            cardinal={selectedCardinal?.cardinalNumber}
            transactions={transactionData?.transactions ?? []}
            counts={transactionData?.counts}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onFetchNextPage={fetchNextPage}
          />
        )}
      </div>
    </main>
  );
}

export { DuesContent };
