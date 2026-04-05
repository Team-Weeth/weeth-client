import Image from 'next/image';
import { LandingUserFaceIcon, LandingAdminFaceIcon } from '@/assets/icons/landing';

interface ServiceSectionHeaderProps {
  className?: string;
  variant: 'user' | 'admin';
  serviceLabel: string;
  title: string;
  subtitle: string;
  chips: React.ReactNode;
}

function ServiceSectionHeader({
  variant,
  serviceLabel,
  title,
  subtitle,
  chips,
}: ServiceSectionHeaderProps) {
  return (
    <>
      <div className="tablet:mb-[54px] mb-[27px] flex items-center gap-200">
        <span className="typo-sub2 flex items-center gap-[13px] text-[#1E2021]">
          <Image
            src={variant === 'user' ? LandingUserFaceIcon : LandingAdminFaceIcon}
            alt="face-icon"
            width={24}
            height={24}
          />
          {serviceLabel}
        </span>
      </div>

      <h2 className="desktop:text-[48px] tablet:mb-[48px] mt-[clamp(20px,3vh,54px)] mb-[24px] text-[32px] leading-[130%] font-extrabold tracking-[-0.005em] whitespace-pre-line text-[#1E2021]">
        {title}
      </h2>

      <div className="tablet:justify-between tablet:flex-row mt-[clamp(20px,3vh,48px)] mb-[clamp(24px,5vh,86px)] flex w-full max-w-[1123px] flex-col gap-[64px]">
        <p className="tablet:text-[24px] tablet:leading-[32px] text-[14px] leading-[18px] font-semibold text-[#888A8C]">
          {subtitle.split('<br/>').map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </p>
        <div>{chips}</div>
      </div>
    </>
  );
}

export { ServiceSectionHeader };
