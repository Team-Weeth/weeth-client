'use client';

import { AdminSettingIcon } from '@/assets/icons/admin';
import { QuestionCircleIcon } from '@/assets/icons';
import {
  Icon,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { cn } from '@/lib/cn';

interface DuesTopBarProps extends React.HTMLAttributes<HTMLDivElement> {
  isPublic: boolean;
  onPublicChange: (value: boolean) => void;
  onSettingsClick?: () => void;
  /** 계정이 없는 미등록 기수 등에서 공개 토글·설정 진입을 막을 때 사용 */
  disabled?: boolean;
}

function DuesTopBar({
  className,
  isPublic,
  onPublicChange,
  onSettingsClick,
  disabled = false,
  ...props
}: DuesTopBarProps) {
  return (
    <div className={cn('flex items-center justify-between', className)} {...props}>
      <div className="typo-h2 text-text-strong break-keep">회비 관리</div>
      <div className="flex flex-row gap-200">
        <div className="bg-container-neutral flex items-center gap-100 rounded-md px-300 py-200">
          <span className="typo-sub3 text-text-normal">부원에게 공개</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Icon
                  src={QuestionCircleIcon}
                  size={24}
                  className="text-icon-alternative flex self-center"
                />
              </TooltipTrigger>
              <TooltipContent>
                공개 시 부원 서비스에 회비 탭이 바로 표시되며, 비공개 시 숨겨집니다.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Switch checked={isPublic} onCheckedChange={onPublicChange} disabled={disabled} />
        </div>

        <button
          type="button"
          onClick={onSettingsClick}
          disabled={disabled}
          className="border-line bg-button-neutral typo-button2 text-text-strong hover:bg-container-neutral-interaction flex shrink-0 cursor-pointer items-center gap-100 rounded-sm border px-300 py-200 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon src={AdminSettingIcon} size={16} className="text-icon-normal" />
          설정
        </button>
      </div>
    </div>
  );
}

export { DuesTopBar, type DuesTopBarProps };
