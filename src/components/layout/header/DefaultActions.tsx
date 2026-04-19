'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import { Button, Icon } from '@/components/ui';
import { EditIcon, ExitToAppIcon, AvatarIcon } from '@/assets/icons';
import { useWritePost } from '@/hooks/home/useWritePost';
import { useIsAdmin } from '@/hooks/shared';

const CardinalMissingModal = dynamic(() =>
  import('@/components/home/CardinalMissingModal').then((m) => m.CardinalMissingModal),
);
const ProfileIncompleteModal = dynamic(() =>
  import('@/components/home/ProfileIncompleteModal').then((m) => m.ProfileIncompleteModal),
);

function DefaultActions() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    handleWriteClick,
    handleSkipProfile,
    cardinalModalOpen,
    setCardinalModalOpen,
    profileModalOpen,
    setProfileModalOpen,
  } = useWritePost();
  const { isAdmin } = useIsAdmin();

  return (
    <>
      <div className="flex items-center gap-200">
        {pathname.startsWith('/board') && (
          <Button
            variant="primary"
            size="md"
            onClick={handleWriteClick}
            className="typo-button1 gap-100"
          >
            <Icon src={EditIcon} alt="edit" size={20} className="text-icon-inverse" />
            글쓰기
          </Button>
        )}
        {isAdmin && (
          <Button
            variant="secondary"
            size="md"
            onClick={() => router.push('/admin')}
            className="typo-button1 text-text-strong gap-100"
          >
            <Icon src={ExitToAppIcon} alt="exit" size={20} className="text-icon-normal" />
            관리자
          </Button>
        )}
        <button
          type="button"
          aria-label="마이페이지로 이동"
          onClick={() => router.push('/mypage')}
          className="cursor-pointer rounded-full"
        >
          <Image src={AvatarIcon} alt="avatar" width={40} height={40} />
        </button>
      </div>

      <CardinalMissingModal open={cardinalModalOpen} onClose={() => setCardinalModalOpen(false)} />
      <ProfileIncompleteModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSkip={handleSkipProfile}
      />
    </>
  );
}

export { DefaultActions };
