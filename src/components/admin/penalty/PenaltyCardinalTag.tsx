import { ReactNode } from 'react';

export function CardinalTag({ children }: { children: ReactNode }) {
  return (
    <span className="bg-container-neutral-alternative text-text-alternative rounded-[5px] px-2.5 py-[5px] text-[14px] leading-5 font-semibold tracking-[var(--letter-spacing)] whitespace-nowrap">
      {children}
    </span>
  );
}
