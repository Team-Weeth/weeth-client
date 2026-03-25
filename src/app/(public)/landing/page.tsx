import {
  FeatureIntroSection,
  ServiceSection,
  SetupGuideSection,
  TestimonialSection,
  ClubTypesSection,
  CTASection,
  LandingFooter,
} from '@/components/landing';
import { HeroSection, PhilosophySection } from '@/components/landing/DynamicSections';
import { PublicHeader } from '@/components/layout';
import { USER_FEATURES, ADMIN_FEATURES } from '@/constants/landing';

export default function LandingPage() {
  return (
    <>
      <PublicHeader showAuthButtons />
      <main className="flex min-h-screen w-full flex-col overflow-x-clip">
        <HeroSection />
        <PhilosophySection />
        <div className="[content-visibility:auto]">
          <FeatureIntroSection />
        </div>
        <div className="[content-visibility:auto]">
          <ServiceSection
            variant="user"
            title={`쉽고 직관적인\n동아리 참여 서비스`}
            subtitle="세션과 일정을 한눈에 확인하고, <br/>출석을 간편하게 참여할 수 있습니다."
            serviceLabel="유저 서비스"
            features={USER_FEATURES}
          />
        </div>
        <div className="[content-visibility:auto]">
          <ServiceSection
            variant="admin"
            title={`동아리 운영에 특화된\n운영 관리 서비스`}
            subtitle="기수별 멤버 관리와 정기모임 출석을 하나의 흐름 안에서 운영할 수 있습니다."
            serviceLabel="관리자 서비스"
            features={ADMIN_FEATURES}
          />
        </div>
        <div className="[content-visibility:auto]">
          <SetupGuideSection />
        </div>
        <div className="[content-visibility:auto]">
          <TestimonialSection />
        </div>
        <div className="[content-visibility:auto]">
          <ClubTypesSection />
        </div>
        <div className="[content-visibility:auto]">
          <CTASection />
        </div>
        <LandingFooter />
      </main>
    </>
  );
}
