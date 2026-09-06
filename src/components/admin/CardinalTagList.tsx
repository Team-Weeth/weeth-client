import { CardinalTag, type CardinalTagProps } from '@/components/admin/CardinalTag';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { cn } from '@/lib/cn';
import { formatCardinalLabel, getVisibleMemberCardinals } from '@/utils/admin/memberTableUtils';

interface CardinalTagListProps extends Pick<CardinalTagProps, 'size'> {
  /** 활동기수 전체, e.g. "1, 2" */
  cardinal: string;
  className?: string;
}

/** 활동기수 태그를 2개까지 노출하고, 나머지는 '+N' 태그 + 툴팁으로 접는다. */
function CardinalTagList({ cardinal, size, className }: CardinalTagListProps) {
  const { visibleCardinals, hiddenCardinals, hiddenCardinalCount } =
    getVisibleMemberCardinals(cardinal);
  const hiddenCardinalLabel = hiddenCardinals.map(formatCardinalLabel).join(', ');

  return (
    <div className={cn('flex items-center gap-100 overflow-hidden', className)}>
      {visibleCardinals.map((item) => (
        <CardinalTag key={item} size={size}>
          {formatCardinalLabel(item)}
        </CardinalTag>
      ))}
      {hiddenCardinalCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="cursor-default"
              aria-label={`숨겨진 활동기수 ${hiddenCardinalLabel}`}
              onClick={(event) => event.stopPropagation()}
            >
              <CardinalTag size={size}>+{hiddenCardinalCount}</CardinalTag>
            </button>
          </TooltipTrigger>
          <TooltipContent variant="dark" side="top" align="center" sideOffset={6}>
            {hiddenCardinalLabel}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export { CardinalTagList, type CardinalTagListProps };
