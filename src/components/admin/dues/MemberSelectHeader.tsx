import { BackIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

interface MemberActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
}

function MemberActionButton({ className, ref, ...props }: MemberActionButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'bg-button-neutral text-text-strong hover:bg-button-neutral-interaction shrink-0 cursor-pointer rounded-md whitespace-nowrap transition-colors',
        'typo-button2 px-200 py-200',
        'tablet:typo-button1 tablet:px-400 tablet:py-200',
        className,
      )}
      {...props}
    />
  );
}

interface MemberSelectHeaderProps {
  /** 현재 선택된 부원 수 */
  selectedCount: number;
  /** 선택 해제 */
  onClear: () => void;
  /** 납부 정정 */
  onMarkUnpaid: () => void;
  /** 환불 처리 */
  onRefund: () => void;
  /** 납부 완료 */
  onMarkPaid: () => void;
}

function MemberSelectHeader({
  selectedCount,
  onClear,
  onMarkUnpaid,
  onRefund,
  onMarkPaid,
}: MemberSelectHeaderProps) {
  const actions = [
    { label: '납부 정정', onClick: onMarkUnpaid },
    { label: '환불 처리', onClick: onRefund },
    { label: '납부 완료', onClick: onMarkPaid },
  ];

  return (
    <div className="bg-container-primary tablet:px-400 sticky top-0 z-10 -mt-15 flex h-15 items-center justify-between gap-200 px-300">
      <div className="tablet:gap-300 flex min-w-0 items-center gap-200">
        <button
          type="button"
          onClick={onClear}
          aria-label="선택 해제"
          className="text-text-inverse hover:bg-container-primary-interaction flex shrink-0 cursor-pointer self-center rounded-sm p-200 transition-colors"
        >
          <Icon src={BackIcon} alt="" size={18} />
        </button>
        <span className="typo-sub3 text-text-inverse whitespace-nowrap">
          {selectedCount}
          <span className="tablet:hidden">명</span>
          <span className="tablet:inline hidden">명 선택됨</span>
        </span>
      </div>
      <div className="tablet:gap-200 flex gap-100">
        {actions.map((action) => (
          <MemberActionButton key={action.label} onClick={action.onClick}>
            {action.label}
          </MemberActionButton>
        ))}
      </div>
    </div>
  );
}

export { MemberSelectHeader, MemberActionButton, type MemberSelectHeaderProps };
