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

  return (
    <div
      ref={dragScrollRef}
      role="group"
      aria-label="기수 필터"
      className={cn(
        'border-line scrollbar-none flex w-max max-w-full cursor-grab items-center gap-700 overflow-x-auto border-b px-600 select-none active:cursor-grabbing',
        className,
      )}
      onMouseDown={onMouseDown}
    >
      <CardinalCard
        aria-pressed={selectedCardinal === 'all'}
        variant={selectedCardinal === 'all' ? 'active' : 'normal'}
        title="전체"
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
        <AddCardinalButton />
      </AddCardinalModal>
    </div>
  );
}

export { CardinalPillList, type CardinalPillListProps };
