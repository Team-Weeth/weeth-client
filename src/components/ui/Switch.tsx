'use client';

import { Switch as RadixSwitch } from 'radix-ui';

import { cn } from '@/lib/cn';

interface SwitchProps extends React.ComponentProps<typeof RadixSwitch.Root> {
  ref?: React.Ref<HTMLButtonElement>;
}

function Switch({ className, ref, ...props }: SwitchProps) {
  return (
    <RadixSwitch.Root
      ref={ref}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-[10px] disabled:cursor-not-allowed disabled:opacity-50',
        'before:absolute before:inset-x-[2px] before:top-1/2 before:h-[15px] before:-translate-y-1/2 before:rounded-[10px] before:transition-colors',
        'data-[state=checked]:before:bg-brand-primary data-[state=unchecked]:before:bg-button-neutral',
        className,
      )}
      {...props}
    >
      <RadixSwitch.Thumb className="bg-container-neutral relative z-10 block size-5 rounded-full shadow-sm transition-transform will-change-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
    </RadixSwitch.Root>
  );
}

export { Switch, type SwitchProps };
