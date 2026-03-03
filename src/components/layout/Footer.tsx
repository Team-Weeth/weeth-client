import Image from 'next/image';
import FooterIcon from '@/assets/icons/logo/logo_full_Footer.svg';
interface FooterProps {
  isSmall?: boolean;
}

export default function Footer({ isSmall = false }: FooterProps) {
  return (
    <>
      {!isSmall ? (
        <footer className="bg-container-neutral-alternative flex flex-col items-center justify-center gap-[67px] px-[18px] py-[26px]">
          <div className="flex w-[992px] gap-4">
            <div className="flex flex-col gap-200">
              <p className="typo-caption1 text-text-normal">Leets Makers</p>
              <p className="typo-body2 text-text-alternative">Weeth Admin</p>
              <p className="typo-body2 text-text-alternative">Leets Makers Site</p>
              <p className="typo-body2 text-text-alternative">문의 메일</p>
            </div>
            <div className="flex flex-col gap-200">
              <p className="typo-caption1 text-text-normal">Leets</p>
              <p className="typo-body2 text-text-alternative">Leets Site</p>
              <p className="typo-body2 text-text-alternative">문의 메일</p>
            </div>
          </div>
          <div className="flex w-[992px] flex-col gap-[10px]">
            <Image src={FooterIcon} width={90} height={40} alt="logo" />
            <p className="typo-caption1 text-text-disabled">© Weeth ALL RIGHTS RESERVED.</p>
          </div>
        </footer>
      ) : (
        <footer className="bg-container-neutral-alternative flex w-[304px] flex-col gap-[67px] rounded-lg px-[18px] py-[26px]">
          <div className="flex flex-col gap-200">
            <p className="typo-caption1 text-text-normal">Weeth 서비스</p>
            <p className="typo-body2 text-text-alternative">서비스 소개</p>
            <p className="typo-body2 text-text-alternative">관리자 서비스</p>
            <p className="typo-body2 text-text-alternative">문의 메일</p>
          </div>
          <div className="flex flex-col gap-[10px]">
            <Image src={FooterIcon} width={90} height={40} alt="logo" />
            <p className="typo-caption1 text-text-disabled">© Weeth ALL RIGHTS RESERVED.</p>
          </div>
        </footer>
      )}
    </>
  );
}
