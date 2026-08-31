import AdminCardViewIcon from '@/assets/icons/admin/ic_admin_card_view.svg';
import AdminChartViewIcon from '@/assets/icons/admin/ic_admin_chart_view.svg';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

type MemberViewMode = 'table' | 'card';

interface MemberViewToggleProps extends React.HTMLAttributes<HTMLDivElement> {
  value: MemberViewMode;
  onValueChange: (value: MemberViewMode) => void;
}

const VIEW_OPTIONS = [
  { value: 'table', label: '표 보기', icon: AdminChartViewIcon },
  { value: 'card', label: '카드 보기', icon: AdminCardViewIcon },
] as const;

function MemberViewToggle({ className, value, onValueChange, ...props }: MemberViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="멤버 보기 방식"
      className={cn(
        'flex w-fit items-start gap-0.5 rounded-[10px] bg-neutral-200 p-[3px]',
        className,
      )}
      {...props}
    >
      {VIEW_OPTIONS.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            aria-pressed={isActive}
            onClick={() => onValueChange(option.value)}
            className={cn(
              'flex size-8 cursor-pointer items-center justify-center rounded-sm transition-[background-color,box-shadow]',
              isActive && 'bg-container-neutral shadow-sm',
            )}
          >
            <Icon
              src={option.icon}
              size={12}
              className={isActive ? 'text-icon-normal' : 'text-icon-disabled'}
            />
          </button>
        );
      })}
    </div>
  );
}

export { MemberViewToggle, type MemberViewMode, type MemberViewToggleProps };
