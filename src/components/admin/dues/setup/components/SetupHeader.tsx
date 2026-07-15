import { Icon, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui';
import { BackButton } from '../../BackButton';
import { QuestionCircleIcon } from '@/assets/icons';

function SetupHeader({ cardinalNumber }: { cardinalNumber: number }) {
  return (
    <div className="flex flex-col gap-300">
      <BackButton />
      <div className="flex items-center gap-200">
        <h1 className="typo-h2 text-text-strong">{cardinalNumber}기 총 회비 설정</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger aria-label="회비 설정 안내">
              <Icon src={QuestionCircleIcon} size={24} className="text-icon-alternative" />
            </TooltipTrigger>
            <TooltipContent>다음으로 버튼을 눌러야 변경사항이 저장됩니다.</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export { SetupHeader };
