import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui';
import { ArrowRightIcon, CopyIcon } from '@/assets/icons';
import { toastSuccess } from '@/stores/useToastStore';

interface SupportListItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  title: string;
  description?: string;
  variant?: 'link' | 'copy';
  href?: string;
  copyText?: string;
  layout?: 'card' | 'row';
}

function SupportListItem({
  title,
  description,
  variant = 'link',
  href,
  copyText,
  layout = 'card',
  className,
  onClick,
  ...props
}: SupportListItemProps) {
  const hasSubContent = !!description || variant === 'copy';
  const isRow = layout === 'row';

  const content = (
    <>
      <div
        className={cn(
          'flex w-full',
          isRow ? 'items-center justify-between gap-100' : 'flex-col',
          !isRow && hasSubContent && 'gap-100',
        )}
      >
        <div className={cn('flex min-w-0', isRow ? 'items-center' : 'w-full flex-col')}>
          <span className={'typo-button1 text-text-strong'}>{title}</span>
          {!isRow && hasSubContent && (
            <div className="flex flex-row items-center gap-200">
              {description && <p className="typo-body2 text-text-alternative">{description}</p>}
              {variant === 'copy' && (
                <Icon src={CopyIcon} size={16} className="text-icon-alternative" alt="복사버튼" />
              )}
            </div>
          )}
        </div>

        {isRow ? (
          variant === 'copy' ? (
            <span className="bg-button-neutral typo-button2 text-text-strong inline-flex shrink-0 items-center justify-center rounded-sm px-300 py-200">
              복사하기
            </span>
          ) : (
            <Icon
              src={ArrowRightIcon}
              size={12}
              className="text-icon-normal"
              alt="페이지 이동버튼"
            />
          )
        ) : (
          <span className="text-icon-alternative absolute top-3.75 right-300">
            {variant === 'link' && (
              <Icon
                src={ArrowRightIcon}
                size={12}
                className="text-icon-normal"
                alt="페이지 이동버튼"
              />
            )}
          </span>
        )}
      </div>
    </>
  );

  const baseClass = cn(
    isRow
      ? 'relative flex w-full cursor-pointer flex-col items-start px-400 py-300 text-left'
      : 'bg-container-neutral relative flex w-full cursor-pointer flex-col items-start rounded-lg px-400 py-300 text-left',
    className,
  );

  if (variant === 'link' && href) {
    return (
      <Link href={href} className={baseClass}>
        {content}
      </Link>
    );
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (copyText) {
      navigator.clipboard.writeText(copyText);
      toastSuccess('복사되었습니다!');
    }
    onClick?.(e);
  };

  return (
    <button type="button" onClick={handleClick} className={baseClass} {...props}>
      {content}
    </button>
  );
}

export { SupportListItem, type SupportListItemProps };
