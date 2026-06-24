'use client';

import { useState, useEffect, useMemo } from 'react';

import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

import { SearchIcon, ArrowLeftIcon, ArrowRightIcon } from '@/assets/icons';
import { BackButton } from '@/components/admin/dues';
import {
  Avatar,
  AvatarFallback,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { adminMemberApi } from '@/lib/apis/adminMember';
import { useDuesSetupValues, useDuesSetupActions } from '@/stores/useDuesSetupStore';

import { DuesSetupStepIndicator } from './component/DuesSetupStepIndicator';

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

  const { data: members = [] } = useQuery({
    queryKey: ['admin', 'members', clubId],
    queryFn: () => adminMemberApi.getMembers(clubId).then((res) => res.data.data),
    staleTime: 5 * 60 * 1000,
  });

  // 첫 진입 시 ACTIVE 멤버 전체 선택으로 초기화
  useEffect(() => {
    if (!memberIdsInitialized && members.length > 0) {
      const activeIds = members
        .filter((m) => m.memberStatus === 'ACTIVE')
        .map((m) => m.clubMemberId);
      setField({ selectedMemberIds: activeIds, memberIdsInitialized: true });
    }
  }, [members, memberIdsInitialized, setField]);

  const selectedSet = useMemo(() => new Set(selectedMemberIds), [selectedMemberIds]);

  const filteredMembers = useMemo(() => {
    const active = members.filter((m) => m.memberStatus === 'ACTIVE');
    const byTab =
      tab === 'selected'
        ? active.filter((m) => selectedSet.has(m.clubMemberId))
        : tab === 'excluded'
          ? active.filter((m) => !selectedSet.has(m.clubMemberId))
          : active;
    return search.trim() ? byTab.filter((m) => m.name.includes(search.trim())) : byTab;
  }, [members, tab, search, selectedSet]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const pagedMembers = filteredMembers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalCount = members.filter((m) => m.memberStatus === 'ACTIVE').length;
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
            <div className="bg-container-neutral-alternative flex items-center gap-200 rounded-sm px-400 py-300">
              <Icon
                src={SearchIcon}
                alt="검색"
                size={18}
                className="text-icon-alternative shrink-0"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="이름으로 검색하기"
                className="typo-body2 placeholder:text-text-alternative text-text-normal min-w-0 flex-1 bg-transparent focus:outline-none"
              />
            </div>
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
              {pagedMembers.map((member) => {
                const isSelected = selectedSet.has(member.clubMemberId);
                return (
                  <TableRow
                    key={member.clubMemberId}
                    className="cursor-pointer"
                    onClick={() => toggleMember(member.clubMemberId)}
                  >
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleMember(member.clubMemberId)}
                        onClick={(e) => e.stopPropagation()}
                        className="accent-brand-primary size-4 cursor-pointer"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-300">
                        <Avatar size={40}>
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="typo-body2 text-text-normal">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="typo-body2 text-text-normal">
                      {member.department}
                    </TableCell>
                    <TableCell className="typo-body2 text-text-normal">
                      {ROLE_LABEL[member.memberRole] ?? member.memberRole}
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
              {pagedMembers.length === 0 && (
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
            <div className="flex items-center justify-center gap-100">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex size-8 cursor-pointer items-center justify-center rounded-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="이전 페이지"
              >
                <Image src={ArrowLeftIcon} alt="" width={16} height={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={cn(
                    'typo-body2 flex size-8 cursor-pointer items-center justify-center rounded-sm transition-colors',
                    p === page
                      ? 'bg-container-primary text-text-inverse'
                      : 'text-text-alternative hover:bg-container-neutral-interaction',
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex size-8 cursor-pointer items-center justify-center rounded-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="다음 페이지"
              >
                <Image src={ArrowRightIcon} alt="" width={16} height={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push(`/${clubId}/admin/dues/setup/1`)}
          className="bg-button-neutral hover:bg-container-neutral-interaction typo-button1 text-text-normal flex cursor-pointer items-center gap-100 rounded-md px-400 py-300 transition-colors"
        >
          <Image src={ArrowLeftIcon} alt="" width={20} height={20} />
          이전으로
        </button>
        <button
          type="button"
          onClick={() => router.push(`/${clubId}/admin/dues/setup/3`)}
          className="bg-button-primary hover:bg-button-primary-interaction typo-button1 text-text-inverse flex cursor-pointer items-center gap-100 rounded-md px-400 py-300 transition-colors"
        >
          다음으로
          <Image src={ArrowRightIcon} alt="" width={20} height={20} />
        </button>
      </div>
    </div>
  );
}

export { DuesSetupStep2 };
