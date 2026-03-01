'use client';

import * as React from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import Image from 'next/image';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';
import { Button, type ButtonProps } from '@/components/ui/Button';

import InfoIcon from '@/assets/icons/info.svg';
import DeleteIcon from '@/assets/icons/delete_forever.svg';

const alertDialogStatusVariants = cva('', {
  variants: {
    status: {
      default: '',
      danger: '',
    },
  },
  defaultVariants: {
    status: 'default',
  },
});

type AlertStatus = NonNullable<VariantProps<typeof alertDialogStatusVariants>['status']>;

const AlertDialogContext = React.createContext<{ status: AlertStatus }>({
  status: 'default',
});

const statusConfigs: Record<
  AlertStatus,
  {
    title: string;
    description: string;
    icon: typeof InfoIcon;
    actionVariant: ButtonProps['variant'];
  }
> = {
  default: {
    title: '변경 사항을 적용하시겠어요?',
    description: "선택한 내용이 저장됩니다.\n진행하시려면 '확인'을 눌러주세요.",
    icon: InfoIcon,
    actionVariant: 'primary',
  },
  danger: {
    title: '이 게시글을 삭제하시겠어요?',
    description: '삭제된 게시글은 복구할 수 없습니다.\n신중히 확인 후 진행해 주세요.',
    icon: DeleteIcon,
    actionVariant: 'danger',
  },
};

interface AlertDialogProps extends React.ComponentProps<typeof AlertDialogPrimitive.Root> {
  status?: VariantProps<typeof alertDialogStatusVariants>['status'];
  /** 간소화 모드: trigger 엘리먼트를 전달하면 내부에서 Content/Header/Footer를 자동 렌더링 */
  trigger?: React.ReactNode;
  /** 기본값: status에 따라 자동 설정 */
  title?: string;
  /** 기본값: status에 따라 자동 설정 */
  description?: string;
}

function AlertDialog({
  status = 'default',
  trigger,
  title,
  description,
  children,
  ...props
}: AlertDialogProps) {
  const resolvedStatus = status ?? 'default';
  const defaults = statusConfigs[resolvedStatus];
  const resolvedTitle = title ?? defaults.title;
  const resolvedDescription = description ?? defaults.description;

  return (
    <AlertDialogContext.Provider value={{ status: resolvedStatus }}>
      <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props}>
        {trigger !== undefined ? (
          <>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{resolvedTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {resolvedDescription.split('\n').map((line, i, arr) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>{children}</AlertDialogFooter>
            </AlertDialogContent>
          </>
        ) : (
          children
        )}
      </AlertDialogPrimitive.Root>
    </AlertDialogContext.Provider>
  );
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

function AlertDialogPortal({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          'bg-background border-line data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-[339px] max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-300 rounded-lg border p-500 pb-400 duration-200',
          className,
        )}
        style={{ boxShadow: 'var(--shadow-dialog)' }}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  const { status } = React.useContext(AlertDialogContext);
  const Icon = statusConfigs[status].icon;

  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col items-center gap-400', className)}
      {...props}
    >
      <Image src={Icon} alt="" width={48} height={48} />
      <div className="flex flex-col items-center gap-200 text-center">{props.children}</div>
    </div>
  );
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn('border-line flex flex-col gap-200 border-t pt-200', className)}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('typo-sub1 text-text-strong', className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('typo-body2 text-text-alternative mb-500', className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  variant,
  size = 'lg',
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> &
  Pick<ButtonProps, 'variant' | 'size'>) {
  const { status } = React.useContext(AlertDialogContext);
  const defaultVariant = variant ?? statusConfigs[status].actionVariant;

  return (
    <AlertDialogPrimitive.Action asChild data-slot="alert-dialog-action">
      <Button variant={defaultVariant} size={size} className={cn('w-full', className)} {...props} />
    </AlertDialogPrimitive.Action>
  );
}

function AlertDialogCancel({
  className,
  variant = 'secondary',
  size = 'lg',
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> &
  Pick<ButtonProps, 'variant' | 'size'>) {
  return (
    <AlertDialogPrimitive.Cancel asChild data-slot="alert-dialog-cancel">
      <Button variant={variant} size={size} className={cn('w-full', className)} {...props} />
    </AlertDialogPrimitive.Cancel>
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};

export type { AlertDialogProps };
