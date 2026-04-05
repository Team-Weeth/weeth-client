import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { FooterLogoIcon } from '@/assets/icons';
import { FOOTER_MENUS } from '@/constants/landing/landing';

interface LandingFooterProps {
  className?: string;
}

function LandingFooter({ className }: LandingFooterProps) {
  return (
    <footer className={cn('flex w-full flex-col items-center bg-[#EEF2F5] px-600 tablet:px-[80px] desktop:px-[160px]', className)}>
      <div className="flex w-full max-w-[1088px] flex-col gap-[67px] px-[18px] py-[26px]">
        <div className="flex gap-200">
          {FOOTER_MENUS.map(({ title, items }) => (
            <div key={title} className="flex w-[160px] flex-col gap-200">
              <p className="typo-caption1 text-[#1E2021]">{title}</p>
              {items.map((item) => (
                <Link key={item.label} href={item.href} className="typo-body2 text-[#909599]">
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-[10px]">
          <Image src={FooterLogoIcon} alt="Weeth logo" width={90} height={40} />
          <p className="typo-caption1 text-[#B7BCBF]">© Weeth ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
}

export { LandingFooter };
