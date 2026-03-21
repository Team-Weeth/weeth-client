import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui';
import { ArrowRightIcon, CopyIcon } from '@/assets/icons';

interface SupportListItemProps extends React.HTMLAttributes<HTMLDivElement> {
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
        {description && <p className="typo-body2 text-text-alternative">{description}</p>}
      </div>
      <span className="text-icon-alternative absolute top-3.75 right-300">
        {variant === 'copy' ? (
          <Icon src={CopyIcon} size={24} className="text-icon-normal" alt="복사버튼" />
        ) : (
          <Icon src={ArrowRightIcon} size={12} className="text-icon-normal" alt="페이지 이동버튼" />
        )}
      </span>
    </>
  );

  const baseClass = cn(
    'bg-container-neutral relative flex w-full cursor-pointer flex-col items-start rounded-lg p-400',
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
    // TODO: 토스트 메세지로 복사 됐다고 알려주기
    if (copyText) navigator.clipboard.writeText(copyText);
    alert('복사 되었습니다.');
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
      className={baseClass}
      {...props}
    >
      {content}
    </div>
  );
}

export { SupportListItem, type SupportListItemProps };
