'use client';

import { useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { useUnmount } from 'react-use';

import EmptyListIcon from '@/assets/icons/empty_list.svg';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui';
import { CardinalDropdown } from '@/components/common/CardinalDropdown';
import { DuesLeftSection } from '@/components/dues/DuesLeftSection';
import {
  DuesLeftSectionSkeleton,
  DuesPageSkeleton,
  DuesTransactionSectionSkeleton,
} from '@/components/dues/DuesPageSkeleton';
import { DuesTransactionSection } from '@/components/dues/DuesTransactionSection';
import { useDuesCardinals, useDuesMe, useDuesTransactions } from '@/hooks/queries';
import { parseApiError } from '@/lib/error';
import { useClubId, useSelectedCardinalNumber, useSelectedCardinalActions } from '@/stores';

const HELP_MAIL_ADDRESS = 'help@weeth.kr';

const handleContactClick = () => {
  window.location.href = `mailto:${HELP_MAIL_ADDRESS}`;
};

interface DuesContentProps {
  initialIsPrivate?: boolean;
}

function DuesContent({ initialIsPrivate = false }: DuesContentProps) {
  if (initialIsPrivate) {
    return (
      <DuesPageLayout cardinals={[]} onSelectCardinal={() => {}}>
        <DuesPrivateState />
      </DuesPageLayout>
    );
  }

  return <DuesInteractiveContent />;
}

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

function DuesPageLayout({
  cardinals,
  activeCardinal,
  onSelectCardinal,
  children,
}: {
  cardinals: Parameters<typeof CardinalDropdown>[0]['cardinals'];
  activeCardinal?: Parameters<typeof CardinalDropdown>[0]['activeCardinal'];
  onSelectCardinal: Parameters<typeof CardinalDropdown>[0]['onSelect'];
  children: ReactNode;
}) {
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
          activeCardinal={activeCardinal}
          onSelect={onSelectCardinal}
        />
      </div>

      {children}
    </main>
  );
}

function DuesPrivateState() {
  return (
    <DuesStatusState
      title="회비가 공개되지 않았어요"
      description="운영진이 회비를 공개하면 확인할 수 있어요."
    />
  );
}

function DuesErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <DuesStatusState
      title="회비 정보를 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
      action={
        <button
          type="button"
          onClick={onRetry}
          className="typo-button2 text-text-alternative hover:text-text-normal cursor-pointer rounded-sm px-0 py-200"
        >
          다시 시도
        </button>
      }
    />
  );
}

function DuesEmptyState() {
  return (
    <DuesStatusState
      title="아직 회비 내역이 기록되지 않았나봐요!"
      description="혹시 문제가 발생했나요?"
      action={
        <button
          type="button"
          onClick={handleContactClick}
          className="typo-button2 text-text-alternative hover:text-text-normal cursor-pointer rounded-sm px-0 py-200"
        >
          문의하기
        </button>
      }
    />
  );
}

function DuesStatusState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="flex min-h-[520px] w-full flex-col items-center justify-center py-300 text-center">
      <Image src={EmptyListIcon} width={226} height={226} alt="" aria-hidden />
      <div className="flex flex-col items-center gap-[10px]">
        <h2 className="typo-h3 text-text-alternative">{title}</h2>
        <div className="flex items-center justify-center gap-[10px]">
          <span className="typo-body2 text-text-alternative">{description}</span>
          {action ? action : null}
        </div>
      </div>
    </section>
  );
}

export { DuesContent, DuesEmptyState, DuesErrorState };
