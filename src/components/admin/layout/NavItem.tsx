'use client';

import Link from 'next/link';

import { Icon, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui';
import { cn } from '@/lib/cn';
import { PeopleIcon } from '@/assets/icons';

const baseClass =
  'flex h-12 items-center transition-colors text-text-normal hover:bg-container-neutral-interaction';

interface NavItemProps {
  icon: typeof PeopleIcon;
  label: string;
  path: string;
  isActive?: boolean;
  collapsed?: boolean;
  external?: boolean;
  openInWindow?: boolean;
  onClick?: () => void;
}

function NavItem({
  icon,
  label,
  path,
  isActive = false,
  collapsed = false,
  external = false,
  openInWindow = false,
  onClick,
}: NavItemProps) {
  const iconEl = (
    <Icon
      src={icon}
      size={24}
      className={cn('shrink-0', isActive ? 'text-brand-primary' : 'text-icon-alternative')}
    />
  );

  const cls = cn(
    baseClass,
    collapsed ? 'justify-center px-400' : 'gap-300 px-400',
    isActive && 'bg-container-neutral-interaction text-text-strong',
  );

  let el: React.ReactNode;

  if (openInWindow) {
    el = (
      <button
        className={cn(cls, 'w-full cursor-pointer')}
        onClick={() => window.open(path, '_blank', 'noopener,noreferrer')}
      >
        {iconEl}
        {!collapsed && <span className="typo-sub3">{label}</span>}
      </button>
    );
  } else if (external) {
    el = (
      <Link href={path} className={cls} target="_blank" rel="noopener noreferrer">
        {iconEl}
        {!collapsed && <span className="typo-sub3">{label}</span>}
      </Link>
    );
  } else {
    el = (
      <Link href={path} className={cls}>
        {iconEl}
        {!collapsed && <span className="typo-sub3">{label}</span>}
      </Link>
    );
  }

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{el}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return el;
}

export { NavItem, type NavItemProps };
