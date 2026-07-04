'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useUnmount } from 'react-use';

import { EmptyListIcon } from '@/assets/icons';
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

const HELP_MAIL_ADDRESS = 'help@weeth.kr';

const handleContactClick = () => {
  window.location.href = `mailto:${HELP_MAIL_ADDRESS}`;
};

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
  const shouldShowEmptyState = !isLeftSectionLoading && !dues;

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

  useUnmount(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
  });

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

      {shouldShowEmptyState ? (
        <DuesEmptyState />
      ) : (
        <div className="desktop:flex-row flex flex-col gap-500">
          {isLeftSectionLoading ? (
            <DuesLeftSectionSkeleton />
          ) : (
            dues && <DuesLeftSection dues={dues} />
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
      )}
    </main>
  );
}

function DuesEmptyState() {
  return (
    <section className="flex min-h-[520px] w-full flex-col items-center justify-center py-300 text-center">
      <Image src={EmptyListIcon} width={226} height={226} alt="" aria-hidden />
      <div className="flex flex-col items-center gap-[10px]">
        <h2 className="typo-h3 text-text-alternative">아직 회비 내역이 기록되지 않았나봐요!</h2>
        <div className="flex items-center justify-center gap-[10px]">
          <span className="typo-body2 text-text-alternative">혹시 문제가 발생했나요?</span>
          <button
            type="button"
            onClick={handleContactClick}
            className="typo-button2 text-text-alternative hover:text-text-normal cursor-pointer rounded-sm px-0 py-200"
          >
            문의하기
          </button>
        </div>
      </div>
    </section>
  );
}

export { DuesContent, DuesEmptyState };
