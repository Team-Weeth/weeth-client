'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  Button,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui';
import { HUB_ACTION_CONFIG } from '@/constants/hub';
import { cn } from '@/lib/cn';

interface HubActionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: 'create' | 'join' | 'go';
  href?: string;
  onAction?: () => void;
}

function HubActionCard({ variant, href, onAction, className, ...props }: HubActionCardProps) {
  const config = HUB_ACTION_CONFIG[variant];

  const button = (
    <Button
      variant={config.buttonVariant}
      size="md"
      onClick={href ? undefined : onAction}
      className="w-19 justify-center px-400 py-300 whitespace-nowrap"
    >
      {config.buttonText}
    </Button>
  );

  return (
    <Item
      className={cn('bg-background-2 flex-nowrap gap-400 rounded-lg p-300', className)}
      {...props}
    >
      <ItemMedia>
        <Image src={config.icon} alt={config.title} width={40} height={40} />
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle className="typo-sub1 text-text-strong">{config.title}</ItemTitle>
        <ItemDescription className="typo-body2 text-text-normal">
          {config.description}
        </ItemDescription>
      </ItemContent>
      <ItemActions className="shrink-0">
        {href ? <Link href={href}>{button}</Link> : button}
      </ItemActions>
    </Item>
  );
}

export { HubActionCard, type HubActionCardProps };
