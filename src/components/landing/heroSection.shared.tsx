'use client';

import { InquiryDialog } from './InquiryDialog';
import { Button } from '../ui';

interface HeroSectionProps {
  className?: string;
}

const DESKTOP_BREAKPOINT = 696;

const TEXT_STYLE = {
  fontSize: 'clamp(72px, 13.9vw, 200px)',
  lineHeight: '160%',
  fontWeight: 700,
  letterSpacing: '-0.005em',
} as const;

function HeroSectionCTA() {
  return (
    <div className="flex gap-3">
      <InquiryDialog>
        <Button className="block w-fit rounded-md bg-[#00C8AA] px-400 py-300 text-[16px] leading-[24px] font-semibold tracking-[-0.005em] text-white hover:bg-[#00877a]">
          가입 문의하기
        </Button>
      </InquiryDialog>
    </div>
  );
}

export { DESKTOP_BREAKPOINT, HeroSectionCTA, TEXT_STYLE };
export type { HeroSectionProps };
