import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface InfoCardItem {
  label: string;
  value: ReactNode;
}

interface InfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  items: InfoCardItem[];
}

export const cardClass = 'bg-container-neutral flex flex-col gap-400 rounded-lg p-450';

function InfoCard({ items, className, ...props }: InfoCardProps) {
  return (
    <div className={cn(cardClass, className, 'w-full')} {...props}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-400">
          <span className="typo-sub2 text-text-alternative w-[78px] shrink-0">{item.label}</span>
          <span className="typo-body1 text-text-strong min-w-0 flex-1">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export { InfoCard, type InfoCardProps, type InfoCardItem };
