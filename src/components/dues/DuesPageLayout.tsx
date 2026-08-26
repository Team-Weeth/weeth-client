import type { ReactNode } from 'react';

import { CardinalDropdown } from '@/components/common/CardinalDropdown';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import type { Cardinal } from '@/types/admin/cardinal';

interface DuesPageLayoutProps {
  cardinals: Cardinal[];
  activeCardinal?: Cardinal;
  onSelectCardinal?: (cardinalId: number) => void;
  children: ReactNode;
}

function DuesPageLayout({
  cardinals,
  activeCardinal,
  onSelectCardinal,
  children,
}: DuesPageLayoutProps) {
  return (
    <main className="max-w-dues mx-auto flex w-full flex-col gap-700 px-450 pt-600 pb-800">
      <div className="flex items-end justify-between gap-400">
        <div className="flex flex-col gap-300">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>회비</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="typo-h2 text-text-strong">회비</h1>
        </div>
        {onSelectCardinal ? (
          <CardinalDropdown
            cardinals={cardinals}
            activeCardinal={activeCardinal}
            onSelect={onSelectCardinal}
          />
        ) : null}
      </div>

      {children}
    </main>
  );
}

export { DuesPageLayout, type DuesPageLayoutProps };
