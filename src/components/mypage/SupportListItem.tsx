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
}

function SupportListItem({
  title,
  description,
  variant = 'link',
  href,
  copyText,
  className,
  ...props
}: SupportListItemProps) {
  const content = (
    <>
      <div className="flex w-full flex-col gap-100">
        <span className="typo-button1 text-text-strong">{title}</span>
        <div className="flex flex-row items-center gap-200">
          {description && <p className="typo-body2 text-text-alternative">{description}</p>}
          {variant === 'copy' && (
            <Icon src={CopyIcon} size={16} className="text-icon-alternative" alt="복사버튼" />
          )}
        </div>
      </div>
      <span className="text-icon-alternative absolute top-3.75 right-300">
        {variant === 'link' && (
          <Icon src={ArrowRightIcon} size={12} className="text-icon-normal" alt="페이지 이동버튼" />
        )}
      </span>
    </>
  );

  const baseClass = cn(
    'bg-container-neutral relative flex w-full cursor-pointer flex-col items-start rounded-lg p-400 text-left',
    className,
  );

  if (variant === 'link' && href) {
    return (
      <Link href={href} className={baseClass}>
        {content}
      </Link>
    );
  }

  const handleClick = () => {
    if (copyText) {
      navigator.clipboard.writeText(copyText);
      toastSuccess('복사되었습니다!');
    }
  };

  return (
    <button type="button" onClick={handleClick} className={baseClass} {...props}>
      {content}
    </button>
  );
}

export { SupportListItem, type SupportListItemProps };
