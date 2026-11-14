import type { Metadata } from 'next';
import { ClubTypesSection } from '@/components/landing/ClubTypesSection';
import {
  PhilosophySection,
  ServiceSection,
  SetupGuideSection,
  CTASection,
} from '@/components/landing/DynamicSections';
import { HeroSection } from '@/components/landing/HeroSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { TestimonialSection } from '@/components/landing/TestimonialSection';
import PublicHeader from '@/components/layout/header/PublicHeader';
import {
  WaxEventTopBanner,
  WaxEventTopBannerSpacer,
} from '@/components/wax-event/WaxEventTopBanner';
import { USER_FEATURES, ADMIN_FEATURES } from '@/constants/landing/landing';
import { WAX_GAME_PATH } from '@/constants/waxEvent';
import { isWaxEventEnabled } from '@/flags/wax/server';

// 이벤트 플래그를 바꾸면 1분 안에 랜딩에 반영된다.
export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: '우리 동아리만의 사이트를 원한다면, 위드' },
};

export default async function LandingPage() {
  const waxEventEnabled = await isWaxEventEnabled();

  return (
    <>
      <PublicHeader
        topBanner={waxEventEnabled && <WaxEventTopBanner href={WAX_GAME_PATH} />}
        showEventTab={waxEventEnabled}
      />
      <main className="flex min-h-screen w-full flex-col">
        {/* 고정 헤더에 붙은 배너만큼 본문을 내린다. */}
        {waxEventEnabled && <WaxEventTopBannerSpacer />}
        <div>
          <HeroSection />
          <PhilosophySection />
          <ServiceSection
            variant="user"
            title={`쉽고 직관적인\n동아리 참여 서비스`}
            subtitle="세션과 일정을 한눈에 확인하고, <br/>출석을 간편하게 참여할 수 있습니다."
            serviceLabel="유저 서비스"
            features={USER_FEATURES}
          />
          <ServiceSection
            variant="admin"
            title={`동아리 운영에 특화된\n운영 관리 서비스`}
            subtitle="기수별 멤버 관리와 정기모임 출석을 <br/>하나의 흐름 안에서 운영할 수 있습니다."
            serviceLabel="운영진 서비스"
            features={ADMIN_FEATURES}
          />
          <SetupGuideSection />
          <TestimonialSection />
          <ClubTypesSection />
        </div>
        <CTASection />
        <LandingFooter />
      </main>
    </>
  );
}
