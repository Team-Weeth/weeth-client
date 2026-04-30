'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DeleteIcon, LogoIcon, MenuIcon } from '@/assets/icons';
import {
  buttonVariants,
  Icon,
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { NAV_ITEMS } from '@/constants/landing/landing';
import { InquiryDialog } from '@/components/landing/InquiryDialog';

interface PublicHeaderProps {
  className?: string;
  showAuthButtons?: boolean;
}

function PublicMobileMenu({ showAuthButtons }: { showAuthButtons: boolean }) {
  const [inquiryOpen, setInquiryOpen] = useState(false);

  return (
    <>
      <InquiryDialog open={inquiryOpen} onOpenChange={setInquiryOpen} />
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="메뉴 열기"
            className="flex cursor-pointer items-center justify-center rounded-sm outline-none"
          >
            <Icon src={MenuIcon} alt="menu" size={40} className="text-icon-normal p-2" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="right"
          overlayClassName="bg-transparent"
          className="data-[state=closed]:slide-out-to-right-0 data-[state=open]:slide-in-from-right-0 top-0 h-dvh w-full max-w-none bg-white shadow-none duration-0 data-[state=closed]:animate-none data-[state=open]:animate-none"
        >
          <div className="flex items-center justify-between px-450 py-3">
            <SheetClose asChild>
              <Link href="/landing" aria-label="홈으로 이동">
                <Image
                  src={LogoIcon}
                  alt="Weeth-logo"
                  width={90}
                  height={40}
                  className="h-[40px] w-[90px]"
                />
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <button
                type="button"
                aria-label="메뉴 닫기"
                className="flex cursor-pointer items-center justify-center rounded-sm outline-none"
              >
                <Icon src={DeleteIcon} alt="close" size={40} className="text-icon-normal p-2" />
              </button>
            </SheetClose>
          </div>

          <nav className="flex flex-col items-start gap-200 px-450 py-400" aria-label="랜딩 메뉴">
            <SheetClose asChild>
              <button
                type="button"
                className="cursor-pointer py-300 text-[24px] leading-[30px] font-bold tracking-[-0.005em]"
                onClick={() => setInquiryOpen(true)}
              >
                가입문의
              </button>
            </SheetClose>

            {showAuthButtons && (
              <>
                <SheetClose asChild>
                  <Link
                    href="/login"
                    className="cursor-pointer py-300 text-[24px] leading-[30px] font-bold tracking-[-0.005em]"
                  >
                    로그인
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/login?intent=create"
                    className="cursor-pointer py-300 text-[24px] leading-[30px] font-bold tracking-[-0.005em]"
                  >
                    지금 무료로 시작하기
                  </Link>
                </SheetClose>
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default function PublicHeader({ className, showAuthButtons = true }: PublicHeaderProps) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const shouldShow = currentY < 10 || currentY < lastScrollY.current;

      lastScrollY.current = currentY;

      setVisible((prev) => {
        if (prev === shouldShow) return prev;
        return shouldShow;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: visible ? 0 : -80, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={cn(
        'fixed top-0 left-0 z-1 w-full bg-[#F3F5F7]',
        !visible && 'pointer-events-none',
        className,
      )}
    >
      <div className="tablet:hidden flex items-center justify-between bg-[#F3F5F7] px-450 py-3">
        <Link href="/landing" aria-label="홈으로 이동">
          <Image
            src={LogoIcon}
            alt="Weeth-logo"
            width={90}
            height={40}
            className="h-[40px] w-[90px]"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </Link>
        <PublicMobileMenu showAuthButtons={showAuthButtons} />
      </div>

      <div className="tablet:flex hidden w-full items-center justify-between px-450 py-300">
        <div className="flex items-center gap-300">
          <Link href="/landing" aria-label="홈으로 이동">
            <Image
              src={LogoIcon}
              alt="Weeth-logo"
              width={90}
              height={40}
              className="h-[40px] w-[90px]"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </Link>
          <nav className="flex items-center gap-300">
            {NAV_ITEMS.map(({ id, label, href }) =>
              id === 'contact' ? (
                <InquiryDialog key={id}>
                  <button
                    type="button"
                    className="typo-button1 cursor-pointer whitespace-nowrap text-[#909599] transition-colors hover:text-black"
                  >
                    {label}
                  </button>
                </InquiryDialog>
              ) : (
                <Link
                  key={id}
                  href={href}
                  className="typo-button1 whitespace-nowrap text-[#909599] transition-colors hover:text-black"
                >
                  {label}
                </Link>
              ),
            )}
          </nav>
        </div>
        {showAuthButtons && (
          <div className="flex items-center gap-200">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: 'secondary', size: 'md' }),
                'bg-[#E6EAED] whitespace-nowrap text-black',
              )}
            >
              로그인
            </Link>
            <Link
              href="/login?intent=create"
              className={cn(
                buttonVariants({ variant: 'primary', size: 'md' }),
                'bg-[#00C8AA] whitespace-nowrap text-white',
              )}
            >
              지금 무료로 시작하기
            </Link>
          </div>
        )}
      </div>
    </motion.header>
  );
}

export { PublicHeader };
