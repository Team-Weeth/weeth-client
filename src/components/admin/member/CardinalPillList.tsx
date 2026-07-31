'use client';

import { MoreVerticalIcon } from '@/assets/icons';
import { AddCardinalButton } from './AddCardinalButton';
import { AddCardinalModal } from './modal/AddCardinalModal';
import { CardinalCard } from './CardinalCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@/components/ui';
import { CARDINAL_ERROR_CODE } from '@/constants/errorCode';
import { useDragScroll } from '@/hooks';
import { useCreateCardinal, useSetCurrentCardinal } from '@/hooks/mutations/admin';
import { cn } from '@/lib/cn';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import { getApiErrorCode } from '@/utils/shared';
import type { Cardinal } from '@/types/admin/cardinal';

interface CardinalPillListProps {
  cardinals: Cardinal[];
  selectedCardinal: number | 'all';
  onSelectCardinal: (value: number | 'all') => void;
  className?: string;
}

function CardinalPillList({
  cardinals,
  selectedCardinal,
  onSelectCardinal,
  className,
}: CardinalPillListProps) {
  const { ref: dragScrollRef, onMouseDown } = useDragScroll();
  const { mutate: createCardinal } = useCreateCardinal();
  const { mutate: setCurrentCardinal } = useSetCurrentCardinal();
  const sortedCardinals = [...cardinals].sort((a, b) => b.cardinalNumber - a.cardinalNumber);
  const mobileCardClassName =
    'max-tablet:typo-button2 max-tablet:h-12 max-tablet:w-11 max-tablet:px-[10px] max-tablet:after:left-[10px] max-tablet:after:w-[23px]';
  const mobileAddClassName = 'max-tablet:h-12 max-tablet:w-11 max-tablet:p-200 max-tablet:mr-100';

  return (
    <div
      ref={dragScrollRef}
      role="group"
      aria-label="기수 필터"
      className={cn(
        'border-line max-tablet:pb-px flex w-full items-center border-b',
        'tablet:scrollbar-none tablet:w-max tablet:max-w-full tablet:cursor-grab tablet:gap-700 tablet:overflow-x-auto tablet:px-600 tablet:select-none tablet:active:cursor-grabbing',
        className,
      )}
      onMouseDown={onMouseDown}
    >
      <div className="scrollbar-none tablet:contents tablet:h-auto tablet:w-auto tablet:max-w-none tablet:px-0 flex h-12 w-[331px] max-w-[calc(100%-44px)] shrink-0 cursor-grab items-end gap-200 overflow-x-auto px-200 select-none active:cursor-grabbing">
        <CardinalCard
          aria-pressed={selectedCardinal === 'all'}
          variant={selectedCardinal === 'all' ? 'active' : 'normal'}
          title="전체"
          className={mobileCardClassName}
          onClick={() => onSelectCardinal('all')}
        />
        {sortedCardinals.map((c) => {
          const isActive = selectedCardinal === c.cardinalNumber;
          if (!isActive) {
            return (
              <CardinalCard
                key={c.id}
                aria-pressed={false}
                variant="normal"
                title={`${c.cardinalNumber}기`}
                className={mobileCardClassName}
                onClick={() => onSelectCardinal(c.cardinalNumber)}
              />
            );
          }
          return (
            <DropdownMenu key={c.id}>
              <DropdownMenuTrigger asChild>
                <CardinalCard
                  aria-pressed
                  variant="active"
                  title={`${c.cardinalNumber}기`}
                  className={mobileCardClassName}
                  endIcon={<Icon src={MoreVerticalIcon} size={12} />}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  disabled={c.status === 'IN_PROGRESS'}
                  onSelect={() =>
                    setCurrentCardinal(c.id, {
                      onSuccess: () => toastSuccess('현재 진행 기수로 설정되었습니다.'),
                      onError: () => toastError('현재 진행 기수 설정에 실패했습니다.'),
                    })
                  }
                >
                  현재 진행 기수로 설정
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </div>
      <AddCardinalModal
        onSubmit={({ cardinal, isCurrent }) =>
          createCardinal(
            { cardinalNumber: cardinal, inProgress: isCurrent },
            {
              onSuccess: () => toastSuccess('기수가 추가되었습니다.'),
              onError: (err) => {
                if (getApiErrorCode(err) === CARDINAL_ERROR_CODE.ALREADY_EXISTS) {
                  toastError('이미 존재하는 기수입니다.');
                } else {
                  toastError('기수 추가에 실패했습니다.');
                }
              },
            },
          )
        }
      >
        <AddCardinalButton className={mobileAddClassName} />
      </AddCardinalModal>
    </div>
  );
}

export { CardinalPillList, type CardinalPillListProps };
