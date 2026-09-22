'use client';

import { useEffect, useState } from 'react';
import ArrowDown from '@/assets/icons/arrow_down.svg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Icon } from '@/components/ui/Icon';
import { POSITION_COLORS } from '@/constants/admin/memberPosition';
import { cn } from '@/lib/cn';
import { findScrollContainer } from '@/utils/shared/findScrollContainer';
import type { MemberPositionOption } from '@/types/admin/memberPosition';

interface MemberPositionDropdownProps {
  memberName: string;
  /** 현재 지정된 포지션. 옵션 목록 조회와 무관하게 멤버가 들고 있는 값을 그대로 보여준다. */
  value: MemberPositionOption | null;
  options: readonly MemberPositionOption[];
  /** 옵션 목록 조회 상태. 빈 목록이 '설정된 옵션 없음'인지 '아직 못 받아온 것'인지 구분한다. */
  optionsStatus?: 'success' | 'pending' | 'error';
  /** null이면 지정 해제 */
  onChange: (option: MemberPositionOption | null) => void;
  onAddPosition?: () => void;
  className?: string;
}

const EMPTY_OPTION_LABEL = {
  success: '옵션 없음',
  pending: '불러오는 중',
  error: '불러오지 못했어요',
} as const;

export function MemberPositionDropdown({
  memberName,
  value,
  options,
  optionsStatus = 'success',
  onChange,
  onAddPosition,
  className,
}: MemberPositionDropdownProps) {
  const selected = value;
  const [open, setOpen] = useState(false);
  // 메뉴는 기본 포털(body)에 띄운다. 표를 스크롤하는 컨테이너 안에 띄우면 그 경계에서 잘린다.
  // 여기서는 스크롤을 감지할 대상만 찾아 둔다.
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);
  const setTriggerRef = (node: HTMLButtonElement | null) => {
    // 언마운트(node=null) 때는 컨테이너를 비우지 않는다. 같은 값을 다시 세팅하면 리렌더가 멈춘다.
    if (!node) return;
    setScrollContainer(findScrollContainer(node));
  };

  // 메뉴는 표 위에 떠 있으므로, 표를 스크롤하면 트리거와 어긋나기 전에 닫는다.
  // (메뉴 자체 스크롤은 overscroll-contain으로 표에 전달되지 않는다.)
  useEffect(() => {
    if (!open || !scrollContainer) return;

    const close = () => setOpen(false);
    scrollContainer.addEventListener('scroll', close, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', close);
  }, [open, scrollContainer]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        ref={setTriggerRef}
        aria-label={`${memberName} 포지션: ${selected?.name ?? '미지정'}`}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          // 배경은 칠하지 않고 행 색(기본/호버/선택)이 그대로 비치게 둔다.
          'group typo-body2 text-text-normal border-line focus-visible:outline-brand-primary data-[state=open]:border-text-normal max-tablet:h-[30px] max-tablet:w-[102px] max-tablet:gap-[6px] max-tablet:py-[6px] max-tablet:pr-[6px] max-tablet:pl-[10px] flex w-[140px] cursor-pointer items-center gap-200 rounded-sm border bg-transparent px-300 py-[11px]',
          className,
        )}
      >
        <PositionDot option={selected} />
        <span className="min-w-0 flex-1 truncate text-left">{selected?.name ?? '미지정'}</span>
        <Icon
          src={ArrowDown}
          size={20}
          className="text-icon-normal max-tablet:!size-[14px] shrink-0 group-data-[state=open]:rotate-180"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0"
        onClick={(event) => event.stopPropagation()}
      >
        {/* 설정된 옵션이 없으면 해제할 대상도 없으므로 옵션 추가로만 안내한다.
            아직 못 받아온 상태에서는 추가하기 대신 조회 상태를 보여준다. */}
        {options.length === 0 ? (
          <>
            <DropdownMenuItem
              disabled
              className="text-text-alternative max-tablet:h-auto max-tablet:px-400 max-tablet:py-400 data-[disabled]:cursor-default"
            >
              {EMPTY_OPTION_LABEL[optionsStatus]}
            </DropdownMenuItem>
            {optionsStatus === 'success' && (
              <>
                <DropdownMenuSeparator className="w-full shrink-0" />
                <DropdownMenuItem
                  className="max-tablet:h-auto max-tablet:px-400 max-tablet:py-400"
                  onSelect={onAddPosition}
                >
                  추가하기
                </DropdownMenuItem>
              </>
            )}
          </>
        ) : (
          <>
            {options.map((option) => (
              <DropdownMenuItem
                key={option.id}
                aria-current={option.id === value?.id ? 'true' : undefined}
                className="max-tablet:h-auto max-tablet:gap-[10px] max-tablet:px-400 max-tablet:py-400 gap-200"
                onSelect={() => onChange(option)}
              >
                <PositionDot option={option} />
                <span className="truncate">{option.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="w-full shrink-0" />
            <DropdownMenuItem
              className="text-text-alternative max-tablet:h-auto max-tablet:px-400 max-tablet:py-400"
              onSelect={() => onChange(null)}
            >
              지정 해제
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PositionDot({ option }: { option?: MemberPositionOption | null }) {
  return (
    <span
      aria-hidden
      className={cn(
        'size-[10px] shrink-0 rounded-full',
        option
          ? POSITION_COLORS.find((color) => color.value === option.color)?.className
          : 'bg-icon-disabled',
      )}
    />
  );
}
