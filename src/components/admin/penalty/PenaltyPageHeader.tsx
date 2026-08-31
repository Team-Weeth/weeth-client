'use client';

import { AdminSettingIcon } from '@/assets/icons/admin';
import { Icon } from '@/components/ui';
import { PenaltyCardinalTabs } from './PenaltyCardinalTabs';

interface PenaltyPageHeaderProps {
  cardinalNumbers: number[];
  selectedCardinal: number;
  onSelectCardinal: (cardinalNumber: number) => void;
  onOpenSetting: () => void;
}

function PenaltyPageHeader({
  cardinalNumbers,
  selectedCardinal,
  onSelectCardinal,
  onOpenSetting,
}: PenaltyPageHeaderProps) {
  return (
    <section className="flex shrink-0 flex-col">
      <div className="flex h-[100px] items-center justify-between px-700 py-700">
        <h1 className="typo-h2 text-text-strong">페널티 관리</h1>

        <button
          type="button"
          onClick={onOpenSetting}
          aria-label="페널티 설정"
          className="cursor-pointer transition-colors"
        >
          <Icon
            src={AdminSettingIcon}
            size={20}
            className="text-icon-alternative hover:text-icon-strong"
          />
        </button>
      </div>

      <div className="flex h-14 items-end overflow-hidden px-700">
        <PenaltyCardinalTabs
          cardinalNumbers={cardinalNumbers}
          selectedCardinal={selectedCardinal}
          onSelectCardinal={onSelectCardinal}
        />
      </div>
    </section>
  );
}

export { PenaltyPageHeader, type PenaltyPageHeaderProps };
