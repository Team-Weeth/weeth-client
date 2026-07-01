import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface InfoSectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  children: ReactNode;
}

function InfoSection({ title, children, className, ...props }: InfoSectionProps) {
  return (
    <section className={cn('flex w-full flex-col gap-200', className)} {...props}>
      <h2 className="typo-sub1 text-text-alternative">{title}</h2>
      {children}
    </section>
  );
}

export { InfoSection, type InfoSectionProps };
