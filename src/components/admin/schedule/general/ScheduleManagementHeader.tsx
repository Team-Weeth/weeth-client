import { Icon } from '@/components/ui/Icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { AdminSearchInput } from '@/components/admin/AdminSearchInput';
import { CardinalDropdown } from '@/components/admin/CardinalDropdown';
import InfoCircleIcon from '@/assets/icons/info_circle.svg';
import type { Cardinal } from '@/types/admin/cardinal';

interface ScheduleManagementHeaderProps {
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  cardinals: Cardinal[];
  activeCardinal?: Cardinal;
  onCardinalSelect: (id: number) => void;
  onCardinalSelectAll: () => void;
}

function ScheduleManagementHeader({
  searchValue,
  onSearchValueChange,
  cardinals,
  activeCardinal,
  onCardinalSelect,
  onCardinalSelectAll,
}: ScheduleManagementHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-400">
      <div className="flex items-center gap-200">
        <h1 className="typo-h2 text-text-strong shrink-0">일정 관리</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" aria-label="도움말">
                <Icon src={InfoCircleIcon} size={24} className="text-icon-disabled" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              variant="dark-sm"
              side="bottom"
              sideOffset={4}
              align="start"
              alignOffset={-128}
              className="max-w-[280px]"
            >
              일반 일정과 세션 일정을 추가하고 수정하는 페이지입니다. 동아리 활동과 정기 모임 일정을
              관리할 수 있습니다.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-300">
        <AdminSearchInput
          value={searchValue}
          onValueChange={onSearchValueChange}
          placeholder="검색어를 입력하세요"
        />
        <CardinalDropdown
          cardinals={cardinals}
          activeCardinal={activeCardinal}
          onSelect={onCardinalSelect}
          onSelectAll={onCardinalSelectAll}
          withCard={false}
        />
      </div>
    </div>
  );
}

export { ScheduleManagementHeader, type ScheduleManagementHeaderProps };
