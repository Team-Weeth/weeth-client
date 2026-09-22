import { Fragment } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

const PAGE_SIZES = [10, 20, 50] as const;
export type MemberPageSize = (typeof PAGE_SIZES)[number];

export function MemberPageSizeSelector({
  value,
  onValueChange,
  className,
}: {
  value: MemberPageSize;
  onValueChange: (size: MemberPageSize) => void;
  className?: string;
}) {
  return (
    <div role="group" aria-label="페이지당 멤버 수" className={cn('flex items-center', className)}>
      {PAGE_SIZES.map((size, index) => (
        <Fragment key={size}>
          {index > 0 && <span aria-hidden className="bg-line h-3.5 w-px" />}
          <Button
            variant="tertiary"
            size="lg"
            aria-pressed={value === size}
            className={cn(
              'shrink-0 whitespace-nowrap',
              value === size ? 'text-text-strong' : 'text-text-alternative',
            )}
            onClick={() => onValueChange(size)}
          >
            {size}개
          </Button>
        </Fragment>
      ))}
    </div>
  );
}
