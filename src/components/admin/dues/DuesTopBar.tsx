'use client';

import { AdminSettingIcon } from '@/assets/icons/admin';
import { QuestionCircleIcon } from '@/assets/icons';
import { Icon, Switch } from '@/components/ui';
import { cn } from '@/lib/cn';

interface DuesTopBarProps extends React.HTMLAttributes<HTMLDivElement> {
  isPublic: boolean;
  onPublicChange: (value: boolean) => void;
  onSettingsClick?: () => void;
}

function DuesTopBar({
  className,
  isPublic,
  onPublicChange,
  onSettingsClick,
  ...props
}: DuesTopBarProps) {
  return (
    <div className={cn('flex items-center justify-end gap-300', className)} {...props}>
      <div className="bg-container-neutral flex items-center gap-200 rounded-md px-300 py-200">
        <span className="typo-sub3 text-text-normal">부원에게 공개</span>
        <Icon src={QuestionCircleIcon} size={24} className="text-icon-alternative" />
        <Switch checked={isPublic} onCheckedChange={onPublicChange} />
      </div>
      <button
        type="button"
        onClick={onSettingsClick}
        className="border-line bg-button-neutral typo-button2 text-text-strong hover:bg-container-neutral-interaction flex cursor-pointer items-center gap-100 rounded-sm border px-300 py-200"
      >
        <Icon src={AdminSettingIcon} size={16} className="text-icon-normal" />
        설정
      </button>
    </div>
  );
}

export { DuesTopBar, type DuesTopBarProps };
