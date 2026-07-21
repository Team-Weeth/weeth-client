'use client';

import Link from 'next/link';

import { Icon, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui';
import { cn } from '@/lib/cn';
import { PeopleIcon } from '@/assets/icons';

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
      className={cn('shrink-0', isActive ? 'text-icon-normal' : 'text-icon-alternative')}
    />
  );

  const cls = cn(
    'flex w-full items-center rounded-md transition-colors text-text-normal hover:bg-container-neutral-interaction',
    collapsed ? 'justify-center p-400' : 'gap-300 px-400 py-300',
    isActive && 'bg-container-neutral-interaction',
  );

  let el: React.ReactNode;

  if (openInWindow) {
    el = (
      <button
        className={cn(cls, 'cursor-pointer')}
        onClick={() => window.open(path, '_blank', 'noopener,noreferrer')}
      >
        {iconEl}
        {!collapsed && <span className={cn('typo-sub3 whitespace-nowrap', isActive && 'font-bold')}>{label}</span>}
      </button>
    );
  } else if (onClick) {
    el = (
      <button type="button" className={cn(cls, 'cursor-pointer')} onClick={onClick}>
        {iconEl}
        {!collapsed && <span className={cn('typo-sub3 whitespace-nowrap', isActive && 'font-bold')}>{label}</span>}
      </button>
    );
  } else if (external) {
    el = (
      <Link href={path} className={cls} target="_blank" rel="noopener noreferrer">
        {iconEl}
        {!collapsed && <span className={cn('typo-sub3 whitespace-nowrap', isActive && 'font-bold')}>{label}</span>}
      </Link>
    );
  } else {
    el = (
      <Link href={path} className={cls}>
        {iconEl}
        {!collapsed && <span className={cn('typo-sub3 whitespace-nowrap', isActive && 'font-bold')}>{label}</span>}
      </Link>
    );
  }

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{el}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={6} align="center" variant="dark">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return el;
}

export { NavItem, type NavItemProps };
