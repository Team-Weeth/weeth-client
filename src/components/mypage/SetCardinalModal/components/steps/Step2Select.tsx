import { Tag } from '@/components/ui/tag';
import { cn } from '@/lib/cn';

interface Step2SelectProps {
  availableCardinals: number[];
  selected: Set<number>;
  onToggle: (n: number) => void;
}

function CardinalTags({ cardinals }: { cardinals: number[] }) {
  return (
    <div className="flex flex-wrap gap-100">
      {cardinals.map((n) => (
        <Tag key={n} className="bg-brand-primary/10 text-brand-primary">
          {n}기
        </Tag>
      ))}
    </div>
  );
}

function Step2Select({ availableCardinals, selected, onToggle }: Step2SelectProps) {
  return (
    <div className="px-400 pb-400">
      <div className="grid grid-cols-5 gap-[5px]">
        {availableCardinals.map((cardinal) => (
          <button
            key={cardinal}
            type="button"
            onClick={() => onToggle(cardinal)}
            className={cn(
              'typo-button2 flex min-w-[40px] cursor-pointer items-center justify-center rounded-[10px] px-400 py-200 transition-colors',
              selected.has(cardinal)
                ? 'bg-button-primary text-text-inverse'
                : 'border-line bg-button-neutral text-text-normal border',
            )}
          >
            {cardinal}기
          </button>
        ))}
      </div>
    </div>
  );
}

export { Step2Select, CardinalTags, type Step2SelectProps };
