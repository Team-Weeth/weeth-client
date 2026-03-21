'use client';

import { ChevronRight, Copy } from 'lucide-react';

import { cn } from '@/lib/cn';

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
  const handleClick = () => {
    if (variant === 'copy' && copyText) {
      navigator.clipboard.writeText(copyText);
    } else if (variant === 'link' && href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
      className={cn(
        'relative flex w-full cursor-pointer flex-col items-start rounded-lg bg-container-neutral p-400',
        className,
      )}
      {...props}
    >
      <div className="flex w-full flex-col gap-100">
        <span className="typo-button1 text-text-strong">{title}</span>
        {description && <p className="typo-body2 text-text-alternative">{description}</p>}
      </div>
      <span className="text-icon-alternative absolute right-300 top-[15px]">
        {variant === 'copy' ? <Copy size={20} /> : <ChevronRight size={20} />}
      </span>
    </div>
  );
}

export { SupportListItem, type SupportListItemProps };
