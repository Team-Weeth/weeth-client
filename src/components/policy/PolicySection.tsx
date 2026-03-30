import { cn } from '@/lib/cn';

interface PolicySectionProps {
  heading: string;
  className?: string;
  children: React.ReactNode;
}

function PolicySection({ heading, className, children }: PolicySectionProps) {
  return (
    <div className={cn('flex flex-col gap-400', className)}>
      <p className="typo-sub2 text-brand-primary">{heading}</p>
      <div className="typo-body2 text-text-alternative flex flex-col gap-200">{children}</div>
    </div>
  );
}

export { PolicySection, type PolicySectionProps };
