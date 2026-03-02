// list item component를  shadcn/ui 의 card 로 구현

import * as React from 'react';
import Image from 'next/image';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import ArrowRightIcon from '@/assets/icons/arrow-right.svg';

const cardVariants = cva('bg-container-neutral flex rounded-lg p-400 transition-colors', {
  variants: {
    variant: {
      default: 'flex-col gap-6 rounded-xl border py-6 shadow-sm',
      onlyText:
        'cursor-pointer items-center justify-between hover:bg-container-neutral-interaction',
      buttonSet: 'flex-col gap-500',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface CardProps extends React.ComponentProps<'div'>, VariantProps<typeof cardVariants> {
  overline?: string;
  title?: string;
  description?: string;
  onClick?: () => void;
  primaryButtonText?: string;
  onPrimaryClick?: () => void;
  secondaryButtonText?: string;
  onSecondaryClick?: () => void;
  /** arrow 아이콘 표시 여부 (기본값: true) */
  showArrow?: boolean;
}

function Card({
  className,
  variant,
  overline,
  title,
  description,
  onClick,
  primaryButtonText = '출석하기',
  onPrimaryClick,
  secondaryButtonText = '출석코드 확인',
  onSecondaryClick,
  showArrow = true,
  children,
  ...props
}: CardProps) {
  // onlyText variant
  if (variant === 'onlyText' && title && description) {
    return (
      <div
        data-slot="card"
        className={cn(cardVariants({ variant }), className)}
        onClick={onClick}
        role="button"
        tabIndex={0}
        {...props}
      >
        <div className="flex flex-col gap-200">
          {overline && <p className="typo-caption1 text-text-alternative">{overline}</p>}
          <h3 className="typo-sub1 text-text-strong">{title}</h3>
          <p className="typo-body2 text-text-alternative whitespace-pre-line">{description}</p>
        </div>
        {showArrow && (
          <Image
            src={ArrowRightIcon}
            alt="arrow-right"
            width={24}
            height={24}
            className="text-neutral-800"
          />
        )}
      </div>
    );
  }

  // buttonSet variant
  if (variant === 'buttonSet' && title && description) {
    return (
      <div data-slot="card" className={cn(cardVariants({ variant }), className)} {...props}>
        <div className="flex items-start justify-between gap-300">
          <div className="flex flex-col gap-200">
            {overline && <p className="typo-caption1 text-text-alternative">{overline}</p>}
            <h3 className="typo-sub1 text-text-strong">{title}</h3>
            <p className="typo-body2 text-text-alternative whitespace-pre-line">{description}</p>
          </div>
          {showArrow && (
            <Image
              src={ArrowRightIcon}
              alt="arrow-right"
              width={24}
              height={24}
              className="shrink-0 text-neutral-800"
            />
          )}
        </div>

        <div className="flex flex-col gap-200">
          <Button variant="primary" size="lg" onClick={onPrimaryClick} className="w-full">
            {primaryButtonText}
          </Button>
          <Button variant="secondary" size="lg" onClick={onSecondaryClick} className="w-full">
            {secondaryButtonText}
          </Button>
        </div>
      </div>
    );
  }

  // default variant (기존 동작)
  return (
    <div data-slot="card" className={cn(cardVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
