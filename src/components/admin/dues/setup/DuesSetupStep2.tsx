'use client';

import { useState, useEffect, useMemo } from 'react';

import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

import { SearchIcon, ArrowLeftIcon, ArrowRightIcon } from '@/assets/icons';
import { BackButton, DuesSearchBar } from '@/components/admin/dues';
import {
  Avatar,
  AvatarFallback,
  Icon,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { MOCK_PAYMENT_TARGETS } from '@/constants/mock';
import { useDuesSetupValues, useDuesSetupActions } from '@/stores/useDuesSetupStore';

import {
  DuesSetupStepIndicator,
  NextButton,
  PrevButton,
} from '@/components/admin/dues/setup/components';

type TabType = 'all' | 'selected' | 'excluded';

const PAGE_SIZE = 10;

const ROLE_LABEL: Record<string, string> = {
  LEAD: '리더',
  ADMIN: '관리자',
  USER: '일반멤버',
};

function DuesSetupStep2() {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();

  const { generationNumber, selectedMemberIds, memberIdsInitialized } = useDuesSetupValues();
  const { setField } = useDuesSetupActions();

  const [tab, setTab] = useState<TabType>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // 첫 진입 시 TARGETED 멤버로 초기화
  useEffect(() => {
    if (!memberIdsInitialized) {
      const targetedIds = MOCK_PAYMENT_TARGETS.filter((t) => t.targetStatus === 'TARGETED').map(
        (t) => t.paymentTargetInfo.clubMemberId,
      );
      setField({ selectedMemberIds: targetedIds, memberIdsInitialized: true });
    }
  }, [memberIdsInitialized, setField]);

  const selectedSet = useMemo(() => new Set(selectedMemberIds), [selectedMemberIds]);

  const filteredTargets = useMemo(() => {
    const byTab =
      tab === 'selected'
        ? MOCK_PAYMENT_TARGETS.filter((t) => selectedSet.has(t.paymentTargetInfo.clubMemberId))
        : tab === 'excluded'
          ? MOCK_PAYMENT_TARGETS.filter((t) => !selectedSet.has(t.paymentTargetInfo.clubMemberId))
          : MOCK_PAYMENT_TARGETS;
    return search.trim()
      ? byTab.filter((t) => t.paymentTargetInfo.name.includes(search.trim()))
      : byTab;
  }, [tab, search, selectedSet]);

  const totalPages = Math.max(1, Math.ceil(filteredTargets.length / PAGE_SIZE));
  const pagedTargets = filteredTargets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalCount = MOCK_PAYMENT_TARGETS.length;
  const selectedCount = selectedMemberIds.length;
  const excludedCount = totalCount - selectedCount;

  const toggleMember = (id: number) => {
    const next = selectedSet.has(id)
      ? selectedMemberIds.filter((x) => x !== id)
      : [...selectedMemberIds, id];
    setField({ selectedMemberIds: next });
  };

  const handleTabChange = (next: TabType) => {
    setTab(next);
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="flex min-w-85 flex-col gap-700 p-700">
      {/* 헤더 */}
      <div className="flex flex-col gap-300">
        <BackButton />
        <h1 className="typo-h2 text-text-strong">{generationNumber}기 총 회비 설정</h1>
      </div>

      <div className="flex flex-col gap-600">
        <DuesSetupStepIndicator currentStep={2} />

        <div className="bg-container-neutral flex flex-col gap-600 rounded-lg px-400 py-450">
          {/* 섹션 헤더 */}
          <div className="flex flex-col gap-200">
            <span className="typo-caption1 text-text-alternative">납부 대상 (2/5)</span>
            <h2 className="typo-h3 text-text-normal">이번 회비를 납부할 멤버를 선택해주세요</h2>
          </div>

          {/* 탭 + 검색 */}
          <div className="flex flex-col gap-400">
            <div className="flex gap-200">
              {(
                [
                  { key: 'all', label: `전체 ${totalCount}` },
                  { key: 'selected', label: `선택됨 ${selectedCount}` },
                  { key: 'excluded', label: `제외됨 ${excludedCount}` },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTabChange(key)}
                  className={cn(
                    'typo-body2 cursor-pointer rounded-sm border px-300 py-200 transition-colors',
                    tab === key
                      ? 'bg-container-neutral-alternative text-text-strong border-transparent'
                      : 'text-text-alternative border-border bg-transparent',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* 검색바 */}
            <DuesSearchBar searchQuery={search} setSearchQuery={handleSearch} />
          </div>

          {/* 테이블 */}
          <Table>
            <TableHeader>
              <TableRow className="bg-container-neutral-alternative">
                <TableHead className="typo-caption1 text-text-alternative w-16 text-center">
                  선택
                </TableHead>
                <TableHead className="typo-caption1 text-text-alternative">이름</TableHead>
                <TableHead className="typo-caption1 text-text-alternative">학과</TableHead>
                <TableHead className="typo-caption1 text-text-alternative">직급</TableHead>
                <TableHead className="typo-caption1 text-text-alternative text-right">
                  납부 현황
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedTargets.map(({ targetId, paymentTargetInfo }) => {
                const { clubMemberId, name, department, memberRole } = paymentTargetInfo;
                const isSelected = selectedSet.has(clubMemberId);
                return (
                  <TableRow
                    key={targetId}
                    className="cursor-pointer"
                    onClick={() => toggleMember(clubMemberId)}
                  >
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleMember(clubMemberId)}
                        onClick={(e) => e.stopPropagation()}
                        className="accent-brand-primary size-4 cursor-pointer"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-300">
                        <Avatar size={40}>
                          <AvatarFallback>{name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="typo-body2 text-text-normal">{name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="typo-body2 text-text-normal">{department}</TableCell>
                    <TableCell className="typo-body2 text-text-normal">
                      {ROLE_LABEL[memberRole] ?? memberRole}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          'typo-body2',
                          isSelected ? 'text-brand-primary' : 'text-text-alternative',
                        )}
                      >
                        {isSelected ? '선택됨' : '제외됨'}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
              {pagedTargets.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="typo-body2 text-text-alternative py-700 text-center"
                  >
                    멤버가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                    className={cn(page === 1 && 'pointer-events-none opacity-40')}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(p);
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(totalPages, p + 1));
                    }}
                    className={cn(page === totalPages && 'pointer-events-none opacity-40')}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-between">
        <PrevButton handlePrev={() => router.push(`/${clubId}/admin/dues/setup/1`)} />
        <NextButton handleNext={() => router.push(`/${clubId}/admin/dues/setup/3`)} />
      </div>
    </div>
  );
}

export { DuesSetupStep2 };
