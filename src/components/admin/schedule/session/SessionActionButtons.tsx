import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui';
import { ArrowRightIcon, MoreHorizIcon } from '@/assets/icons';

function AttendanceLink({
  onClick,
  disabled = false,
}: {
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-100 rounded-sm py-200',
        disabled
          ? 'text-text-disabled cursor-not-allowed'
          : 'text-text-alternative cursor-pointer',
      )}
    >
      <span className="typo-button2">출석 관리</span>
      <Icon src={ArrowRightIcon} alt="출석 관리" size={8} />
    </button>
  );
}

function MoreButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="더보기"
      className="flex cursor-pointer items-center justify-center rounded-sm p-200"
    >
      <Icon src={MoreHorizIcon} alt="더보기" size={24} className="text-text-alternative" />
    </button>
  );
}

export { AttendanceLink, MoreButton };
