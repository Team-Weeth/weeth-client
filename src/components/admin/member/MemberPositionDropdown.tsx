'use client';

import { useState } from 'react';
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
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { MemberPositionOption } from '@/types/admin/memberPosition';

interface MemberPositionDropdownProps {
  memberName: string;
  value: string | null;
  options: readonly MemberPositionOption[];
  /** null이면 지정 해제 */
  onChange: (option: MemberPositionOption | null) => void;
  onAddPosition?: () => void;
  className?: string;
}

export function MemberPositionDropdown({
  memberName,
  value,
  options,
  onChange,
  onAddPosition,
  className,
}: MemberPositionDropdownProps) {
  const selected = options.find((option) => option.id === value);
  const isMobile = useMediaQuery('(max-width: 695.98px)');
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const setTriggerRef = (node: HTMLButtonElement | null) => {
    // 언마운트(node=null) 때는 컨테이너를 비우지 않는다. 같은 값을 다시 세팅하면 리렌더가 멈춘다.
    if (!node) return;
    // 고정된 관리자 레이아웃과 같은 stacking context에서 sticky 이름 열 뒤에 표시합니다.
    setPortalContainer(node.closest<HTMLElement>('[data-admin]') ?? null);
  };

  return (
    <DropdownMenu>
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
        portalContainer={isMobile ? portalContainer : undefined}
        align="start"
        className="max-tablet:z-10 w-[var(--radix-dropdown-menu-trigger-width)] min-w-0"
        onClick={(event) => event.stopPropagation()}
      >
        {/* 설정된 옵션이 없으면 해제할 대상도 없으므로 옵션 추가로만 안내한다. */}
        {options.length === 0 ? (
          <>
            <DropdownMenuItem
              disabled
              className="text-text-alternative max-tablet:h-auto max-tablet:px-400 max-tablet:py-400 data-[disabled]:cursor-default"
            >
              옵션 없음
            </DropdownMenuItem>
            <DropdownMenuSeparator className="w-full shrink-0" />
            <DropdownMenuItem
              className="max-tablet:h-auto max-tablet:px-400 max-tablet:py-400"
              onSelect={onAddPosition}
            >
              추가하기
            </DropdownMenuItem>
          </>
        ) : (
          <>
            {options.map((option) => (
              <DropdownMenuItem
                key={option.id}
                aria-current={option.id === value ? 'true' : undefined}
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

function PositionDot({ option }: { option?: MemberPositionOption }) {
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
