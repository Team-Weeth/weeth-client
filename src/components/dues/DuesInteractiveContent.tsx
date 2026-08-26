'use client';

import { useRef, useState } from 'react';
import { useUnmount } from 'react-use';

import { DuesLeftSection } from '@/components/dues/DuesLeftSection';
import { DuesPageLayout } from '@/components/dues/DuesPageLayout';
import {
  DuesLeftSectionSkeleton,
  DuesPageSkeleton,
  DuesTransactionSectionSkeleton,
} from '@/components/dues/DuesPageSkeleton';
import { DuesEmptyState, DuesErrorState, DuesPrivateState } from '@/components/dues/DuesStatusState';
import { DuesTransactionSection } from '@/components/dues/DuesTransactionSection';
import { useDuesCardinals, useDuesMe, useDuesTransactions } from '@/hooks/queries';
import { parseApiError } from '@/lib/error';
import { useClubId, useSelectedCardinalActions, useSelectedCardinalNumber } from '@/stores';

function DuesInteractiveContent() {
  const clubId = useClubId();
  const selectedCardinalNumber = useSelectedCardinalNumber(clubId, 'dues');
  const { select } = useSelectedCardinalActions();
  const [isCardinalTransitioning, setIsCardinalTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    data: cardinals = [],
    isLoading,
    isError: isCardinalsError,
    error: cardinalsError,
    refetch: refetchCardinals,
  } = useDuesCardinals();
  const latestCardinal = cardinals.reduce<(typeof cardinals)[number] | undefined>(
    (latest, cardinal) => {
      if (cardinal.status === 'IN_PROGRESS') return cardinal;
      if (latest?.status === 'IN_PROGRESS') return latest;
      if (!latest) return cardinal;

      return cardinal.cardinalNumber > latest.cardinalNumber ? cardinal : latest;
    },
    undefined,
  );
  // 스토어에 저장된 기수 번호를 현재 기수 목록에서 되찾는다.
  // (기수가 사라졌으면 매칭되지 않아 자동으로 최신 기수로 대체된다)
  const selectedCardinal =
    (selectedCardinalNumber != null
      ? cardinals.find((cardinal) => cardinal.cardinalNumber === selectedCardinalNumber)
      : undefined) ?? latestCardinal;
  const {
    data: dues,
    isLoading: isDuesLoading,
    isError: isDuesError,
    error: duesError,
    refetch: refetchDues,
  } = useDuesMe(selectedCardinal?.cardinalNumber);
  const {
    data: transactionData,
    fetchNextPage,
    hasNextPage,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
    error: transactionsError,
    isFetchingNextPage,
    refetch: refetchTransactions,
  } = useDuesTransactions(selectedCardinal?.cardinalNumber);
  const isPageLoading = !clubId || isLoading;
  const isLeftSectionLoading = !!selectedCardinal && (isDuesLoading || isCardinalTransitioning);
  const isTransactionSectionLoading =
    !!selectedCardinal && (isTransactionsLoading || isCardinalTransitioning);
  const isForbiddenError = [cardinalsError, duesError, transactionsError].some(
    (error) => parseApiError(error)?.status === 403,
  );
  const shouldShowErrorState =
    !isPageLoading &&
    !isForbiddenError &&
    (isCardinalsError ||
      isDuesError ||
      (isTransactionsError && !transactionData?.transactions.length));
  const shouldShowEmptyState =
    !isPageLoading && !shouldShowErrorState && !isLeftSectionLoading && !dues;

  const handleRetry = () => {
    if (isCardinalsError) void refetchCardinals();
    if (isDuesError) void refetchDues();
    if (isTransactionsError) void refetchTransactions();
  };

  const handleSelectCardinal = (cardinalId: number) => {
    if (selectedCardinal?.id === cardinalId) return;

    const target = cardinals.find((cardinal) => cardinal.id === cardinalId);
    if (!clubId || !target) return;

    select(clubId, 'dues', target.cardinalNumber);
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

  if (isPageLoading) {
    return <DuesPageSkeleton />;
  }

  return (
    <DuesPageLayout
      cardinals={cardinals}
      activeCardinal={selectedCardinal}
      onSelectCardinal={handleSelectCardinal}
    >
      {isForbiddenError ? (
        <DuesPrivateState />
      ) : shouldShowErrorState ? (
        <DuesErrorState onRetry={handleRetry} />
      ) : shouldShowEmptyState ? (
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
    </DuesPageLayout>
  );
}

export { DuesInteractiveContent };
