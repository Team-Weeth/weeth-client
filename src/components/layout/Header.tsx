'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Button } from '../ui';
import ExitIcon from '@/assets/icons/exit_to_app.svg';
import AvatarIcon from '@/assets/icons/avatar.svg';
import EditIcon from '@/assets/icons/edit.svg';
import CheckIcon from '@/assets/icons/check_round.svg';
import MenuIcon from '@/assets/icons/menu.svg';

interface HeaderProps {
  isMain?: boolean;
}

const Logo = ({ width = 76, onClick }: { width?: number; onClick: () => void }) => (
  <Image
    src="/assets/logo/logo_full_Origin.svg"
    alt="logo"
    width={width}
    height={40}
    className="mt-[2px] mr-1 mb-[6px] cursor-pointer"
    onClick={onClick}
  />
);

export default function Header({ isMain = true }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = [
    { id: 'board', label: '게시판', href: '/board' },
    { id: 'attendance', label: '출석', href: '/attendance' },
  ];
  const isWritePage = pathname.includes('/write');
  const handleLogoClick = () => {
    router.push(isMain ? '/home' : '/');
  };

  return (
    <>
      <header className="tablet:hidden flex gap-100 py-3 pr-450 pl-200">
        {isMain && (
          <Image src={MenuIcon} alt="menu" width={40} height={40} className="cursor-pointer p-2" />
        )}
        <Logo width={90} onClick={handleLogoClick} />
      </header>
      <header className="tablet:flex flex hidden w-full items-center justify-between px-5 py-3">
        <div className="flex items-center gap-300">
          <Logo onClick={handleLogoClick} />

          {isMain &&
            navItems.map(({ id, label, href }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={id}
                  href={href}
                  className={`typo-button1 py-200 transition-colors ${
                    isActive
                      ? 'text-brand-primary'
                      : 'text-text-alternative hover:text-brand-primary'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
        </div>
        {isMain && (
          <div className="flex items-center gap-200">
            {isWritePage ? (
              <>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => router.back()}
                  className="typo-button1 text-text-strong px-4"
                >
                  작성 취소
                </Button>
                <Button variant="primary" size="md" type="submit" className="typo-button1 gap-100">
                  <Image src={CheckIcon} alt="check" width={20} height={20} />
                  게시하기
                </Button>
              </>
            ) : (
              <>
                {pathname.startsWith('/board') && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => router.push('/board/write')}
                    className="typo-button1 gap-100"
                  >
                    <Image src={EditIcon} alt="edit" width={20} height={20} />
                    글쓰기
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => router.push('/admin')}
                  className="typo-button1 text-text-strong gap-100"
                >
                  <Image src={ExitIcon} alt="exit" width={20} height={20} />
                  관리자 서비스
                </Button>
                <Image
                  src={AvatarIcon}
                  alt="avatar"
                  width={40}
                  height={40}
                  onClick={() => router.push('/mypage')}
                />
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}
