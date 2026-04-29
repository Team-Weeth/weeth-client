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
import { toastError, toastSuccess } from '@/stores/useToastStore';
import { getApiErrorCode } from '@/utils/shared';
import type { Cardinal } from '@/types/admin/cardinal';

interface CardinalPillListProps {
  cardinals: Cardinal[];
  selectedCardinal: number | 'all';
  onSelectCardinal: (value: number | 'all') => void;
}

function CardinalPillList({
  cardinals,
  selectedCardinal,
  onSelectCardinal,
}: CardinalPillListProps) {
  const { ref: dragScrollRef, onMouseDown } = useDragScroll();
  const { mutate: createCardinal } = useCreateCardinal();
  const { mutate: setCurrentCardinal } = useSetCurrentCardinal();

  return (
    <div
      ref={dragScrollRef}
      className="scrollbar-none flex cursor-grab items-center gap-200 overflow-x-auto select-none active:cursor-grabbing"
      onMouseDown={onMouseDown}
    >
      <CardinalCard
        variant={selectedCardinal === 'all' ? 'active' : 'normal'}
        title="전체"
        onClick={() => onSelectCardinal('all')}
      />
      {cardinals.map((c) => {
        const isActive = selectedCardinal === c.cardinalNumber;
        if (!isActive) {
          return (
            <CardinalCard
              key={c.id}
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
