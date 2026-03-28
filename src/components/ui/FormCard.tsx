import { cn } from '@/lib/cn';

import { Card } from './card';
import { Divider } from './Divider';

interface FormCardProps {
  label?: string;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

function FormCard({ label, title, children, footer, className }: FormCardProps) {
  return (
    <Card className={cn('w-full flex-col gap-0 px-400 pt-400 pb-300', className)}>
      {label && <p className="typo-caption1 text-text-alternative mb-200">{label}</p>}
      <p className="typo-sub1 text-text-strong mb-400">{title}</p>
      <div className="flex flex-col gap-200">{children}</div>
      {footer && (
        <>
          <Divider className="my-300" />
          {footer}
        </>
      )}
    </Card>
  );
}

export { FormCard, type FormCardProps };
