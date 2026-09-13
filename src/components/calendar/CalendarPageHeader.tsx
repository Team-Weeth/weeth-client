import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import ArrowDownIcon from '@/assets/icons/arrow_down.svg';
import { CardinalDropdown } from '@/components/common/CardinalDropdown';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import type { Cardinal } from '@/types/admin/cardinal';

interface CalendarPageHeaderProps {
  year: number;
  month: number;
  cardinals: Cardinal[];
  activeCardinal: Cardinal | undefined;
  onOpenMonthPicker: () => void;
  onReset: () => void;
  onCardinalSelect: (id: number | null) => void;
}

function CalendarPageHeader({
  year,
  month,
  cardinals,
  activeCardinal,
  onOpenMonthPicker,
  onReset,
  onCardinalSelect,
}: CalendarPageHeaderProps) {
  return (
    <div className="tablet:px-450 flex flex-col gap-200">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="typo-caption1 text-text-alternative">캘린더</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center">
        <div className="tablet:hidden flex flex-1 items-center">
          <h2 className="typo-h2 text-text-normal">
            {year}.{String(month).padStart(2, '0')}
          </h2>
          <button
            type="button"
            aria-label="달 선택"
            onClick={onOpenMonthPicker}
            className="flex cursor-pointer items-center justify-center rounded-sm p-200"
          >
            <Icon src={ArrowDownIcon} size={24} className="text-icon-normal" />
          </button>
          <Button variant="outlined" size="sm" className="typo-caption1" onClick={onReset}>
            오늘
          </Button>
        </div>
        <div className="tablet:flex hidden flex-1 items-center gap-200">
          <h2 className="typo-h2 text-text-normal">캘린더</h2>
          <Button variant="outlined" size="sm" onClick={onReset}>
            오늘
          </Button>
        </div>
        <CardinalDropdown
          cardinals={cardinals}
          activeCardinal={activeCardinal}
          onSelect={onCardinalSelect}
        />
      </div>
    </div>
  );
}

export { CalendarPageHeader, type CalendarPageHeaderProps };
