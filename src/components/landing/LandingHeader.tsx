'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoIcon } from '@/assets/icons';
import { buttonVariants } from '@/components/ui';
import { cn } from '@/lib/cn';
import { NAV_ITEMS } from '@/constants/landing';

interface LandingHeaderProps {
  className?: string;
}

function LandingHeader({ className }: LandingHeaderProps) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY < 10) {
        setVisible(true);
      } else if (currentY < lastScrollY.current) {
        setVisible(true);
      } else {
        setVisible(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          key="landing-header"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className={cn(
            'fixed top-0 left-0 z-1 flex w-full items-center justify-between bg-[#F3F5F7] px-450 py-300',
            className,
          )}
        >
          <div className="flex items-center gap-300">
            <Link href="/landing" aria-label="홈으로 이동">
              <Image
                src={LogoIcon}
                alt="Weeth-logo"
                width={90}
                height={40}
                className="h-[40px] w-[90px]"
              />
            </Link>
            <nav className="flex items-center gap-300">
              {NAV_ITEMS.map(({ id, label, href }) => (
                <Link
                  key={id}
                  href={href}
                  className="typo-button1 text-[#909599] transition-colors hover:text-black"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-200">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: 'secondary', size: 'md' }),
                'bg-[#E6EAED] text-black',
              )}
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: 'primary', size: 'md' }),
                'bg-[#00C8AA] text-white',
              )}
            >
              지금 무료로 시작하기
            </Link>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}

export { LandingHeader };
