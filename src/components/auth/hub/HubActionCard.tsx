'use client';

import Image from 'next/image';
import Link from 'next/link';

import { HubCreateIcon, HubGoIcon, HubJoinIcon } from '@/assets/icons';
import {
  Button,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui';
import { cn } from '@/lib/cn';

import type { ButtonProps } from '@/components/ui/Button';

const VARIANT_CONFIG = {
  create: {
    icon: HubCreateIcon,
    title: '사이트 새로 개설하기',
    description: '새로운 동아리 사이트를 개설하고 싶은 리더님은 여기!',
    buttonText: '개설',
    buttonVariant: 'primary' as ButtonProps['variant'],
  },
  join: {
    icon: HubJoinIcon,
    title: '동아리에 가입하기',
    description: 'Weeth에 개설된 동아리에 가입하려는 부원님은 여기!',
    buttonText: '가입',
    buttonVariant: 'secondary' as ButtonProps['variant'],
  },
  go: {
    icon: HubGoIcon,
    title: '가입한 동아리 바로가기',
    description: '이미 가입한 동아리의 사이트로 이동하려는 부원님은 여기!',
    buttonText: '바로가기',
    buttonVariant: 'secondary' as ButtonProps['variant'],
  },
} as const;

interface HubActionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: 'create' | 'join' | 'go';
  href?: string;
  onAction?: () => void;
}

function HubActionCard({ variant, href, onAction, className, ...props }: HubActionCardProps) {
  const config = VARIANT_CONFIG[variant];

  const button = (
    <Button
      variant={config.buttonVariant}
      size="md"
      onClick={href ? undefined : onAction}
      className="px-400 py-300"
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
      <ItemActions>{href ? <Link href={href}>{button}</Link> : button}</ItemActions>
    </Item>
  );
}

export { HubActionCard, type HubActionCardProps };
