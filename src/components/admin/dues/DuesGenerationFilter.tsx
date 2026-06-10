import Image from 'next/image';
import { ArrowDownIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';

interface DuesGenerationFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  generation: string;
  lastUpdated: string;
  onGenerationClick?: () => void;
}

function DuesGenerationFilter({
  className,
  generation,
  lastUpdated,
  onGenerationClick,
  ...props
}: DuesGenerationFilterProps) {
  return (
    <div className={cn('flex flex-col items-start gap-200', className)} {...props}>
      <button
        type="button"
        onClick={onGenerationClick}
        className="bg-button-neutral typo-button2 text-text-strong hover:bg-button-neutral-interaction flex cursor-pointer items-center gap-100 rounded-sm px-300 py-200"
      >
        {generation}
        <Image src={ArrowDownIcon} alt="" width={16} height={16} className="text-icon-inverse" />
      </button>
      <span className="typo-caption2 text-text-alternative">최근 업데이트 : {lastUpdated}</span>
    </div>
  );
}

export { DuesGenerationFilter, type DuesGenerationFilterProps };
