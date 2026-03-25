import { LandingMountingImage } from '@/assets/icons/landing';
import Image from 'next/image';

function FeatureIntroSection() {
  return (
    <section
      id="service"
      className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-[#F3F5F7]"
    >
      <h2 className="mt-[83px] mb-[78px] text-center font-[family-name:var(--font-inter)] text-[48px] leading-[100%] font-bold tracking-[-0.5%] text-[#1E2021]">
        참여는 더 자연스럽게
        <br />
        운영은 단순하게
      </h2>

      <Image
        src={LandingMountingImage}
        alt="landing-mounting"
        width={1728}
        height={986}
        className="w-full"
      />
    </section>
  );
}

export { FeatureIntroSection };
