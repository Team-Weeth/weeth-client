import { Suspense } from 'react';
import {
  TestimonialSection,
  ClubTypesSection,
  LandingFooter,
  BlockedToast,
} from '@/components/landing';
import {
  HeroSection,
  PhilosophySection,
  ServiceSection,
  SetupGuideSection,
  CTASection,
} from '@/components/landing/DynamicSections';
import { PublicHeader } from '@/components/layout';
import { USER_FEATURES, ADMIN_FEATURES } from '@/constants/landing/landing';

export default function LandingPage() {
  return (
    <>
      <Suspense>
        <BlockedToast />
      </Suspense>
      {/* TODO: showAuthButtons 추가하기 */}
      <PublicHeader />
      <main className="flex min-h-screen w-full flex-col">
        <div className="overflow-x-clip">
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
            subtitle="기수별 멤버 관리와 정기모임 출석을 하나의 흐름 안에서 운영할 수 있습니다."
            serviceLabel="관리자 서비스"
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
