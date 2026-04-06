'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button, Icon } from '@/components/ui';
import { MenuIcon, EditIcon, SendIcon, ExitToAppIcon, AvatarIcon, LogoIcon } from '@/assets/icons';
import { useCreatePost, useUpdatePost } from '@/hooks';
import { useWritePost } from '@/hooks/home/useWritePost';

const CardinalMissingModal = dynamic(() =>
  import('@/components/home/CardinalMissingModal').then((m) => m.CardinalMissingModal),
);
const ProfileIncompleteModal = dynamic(() =>
  import('@/components/home/ProfileIncompleteModal').then((m) => m.ProfileIncompleteModal),
);

interface HeaderProps {
  isMain?: boolean;
}

const Logo = ({ width = 76, href }: { width?: number; href: string }) => (
  <Link href={href} aria-label="홈으로 이동" className="inline-flex">
    <Image
      src={LogoIcon}
      alt="logo"
      width={width}
      height={40}
      className="mt-[2px] mr-1 mb-[6px] cursor-pointer"
    />
  </Link>
);

export default function Header({ isMain = true }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isWritePage = pathname.includes('/write');
  const editMatch = pathname.match(/^\/board\/edit\/(\d+)$/);
  const editPostId = editMatch ? Number(editMatch[1]) : null;
  const isEditPage = editPostId !== null;
  const { submit: submitCreate, isPending: isCreating } = useCreatePost();
  const { submit: submitUpdate, isPending: isUpdating } = useUpdatePost();
  const {
    handleWriteClick,
    handleSkipProfile,
    cardinalModalOpen,
    setCardinalModalOpen,
    profileModalOpen,
    setProfileModalOpen,
  } = useWritePost();
  const isPostingPage = isWritePage || isEditPage;
  const isPending = isCreating || isUpdating;
  const handleSubmit = () => {
    if (isEditPage && editPostId !== null) {
      submitUpdate(editPostId);
    } else {
      submitCreate();
    }
  };
  const navItems = [
    { id: 'board', label: '게시판', href: '/board' },
    { id: 'attendance', label: '출석', href: '/attendance' },
  ];
  return (
    <>
      <header className="tablet:hidden flex gap-100 py-3 pr-450 pl-200">
        {isMain && (
          <Image src={MenuIcon} alt="menu" width={40} height={40} className="cursor-pointer p-2" />
        )}
        <Logo width={90} href={isMain ? '/home' : '/'} />
      </header>
      <header className="tablet:flex flex hidden w-full items-center justify-between px-5 py-3">
        <div className="flex items-center gap-300">
          <Logo href={isMain ? '/home' : '/'} />

          {!isMain && (
            <>
              {/* TODO: 추후  href 수정 필요 */}
              <Link
                href="#"
                className="typo-button1 text-text-alternative hover:text-text-normal transition-colors"
              >
                서비스소개
              </Link>
              <Link
                href="#"
                className="typo-button1 text-text-alternative hover:text-text-normal transition-colors"
              >
                가입문의
              </Link>
            </>
          )}
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
            {isPostingPage ? (
              <>
                <Button
                  variant="secondary"
                  size="md"
                  className="typo-button1 text-text-strong px-4"
                  onClick={() => router.back()}
                >
                  {isEditPage ? '수정 취소' : '작성 취소'}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  disabled={isPending}
                  onClick={handleSubmit}
                  className="typo-button1 gap-100"
                >
                  <Icon src={SendIcon} size={20} alt="send" className="text-icon-inverse" />
                  {isEditPage
                    ? isPending
                      ? '수정 중...'
                      : '수정 완료'
                    : isPending
                      ? '게시 중...'
                      : '게시하기'}
                </Button>
              </>
            ) : (
              <>
                {pathname.startsWith('/board') && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleWriteClick}
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
                  <Image src={ExitToAppIcon} alt="exit" width={20} height={20} />
                  관리자
                </Button>
                <button
                  type="button"
                  aria-label="마이페이지로 이동"
                  onClick={() => router.push('/mypage')}
                  className="cursor-pointer rounded-full"
                >
                  <Image src={AvatarIcon} alt="avatar" width={40} height={40} />
                </button>
              </>
            )}
          </div>
        )}
      </header>

      <CardinalMissingModal open={cardinalModalOpen} onClose={() => setCardinalModalOpen(false)} />
      <ProfileIncompleteModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSkip={handleSkipProfile}
      />
    </>
  );
}
