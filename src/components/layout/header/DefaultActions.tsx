'use client';

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Avatar, AvatarFallback, AvatarImage, Button, Icon, buttonVariants } from '@/components/ui';
import EditIcon from '@/assets/icons/edit.svg';
import ExitToAppIcon from '@/assets/icons/exit_to_app.svg';
import { useWritePost } from '@/hooks/home/useWritePost';
import { useIsAdmin } from '@/hooks/shared';
import { useUserProfileImageUrl } from '@/stores';
import { useBoardList } from '@/hooks/board/useBoardQuery';
import { useActiveBoardId } from '@/stores/useBoardNavStore';
import { cn } from '@/lib/cn';

const CardinalMissingModal = dynamic(() =>
  import('@/components/home/CardinalMissingModal').then((m) => m.CardinalMissingModal),
);
const ProfileIncompleteModal = dynamic(() =>
  import('@/components/home/ProfileIncompleteModal').then((m) => m.ProfileIncompleteModal),
);

function DefaultActions() {
  const router = useRouter();
  const pathname = usePathname();
  const { clubId } = useParams<{ clubId: string }>();
  const {
    handleWriteClick,
    handleSkipProfile,
    cardinalModalOpen,
    setCardinalModalOpen,
    profileModalOpen,
    setProfileModalOpen,
  } = useWritePost();
  const { isAdmin } = useIsAdmin();
  const profileImageUrl = useUserProfileImageUrl();
  const { data: boards } = useBoardList();
  const activeBoardId = useActiveBoardId();

  const canWrite = (() => {
    if (!boards) return false;
    if (activeBoardId === null) {
      return boards.some((b) => b.boardConfig?.canWrite === true);
    }
    const activeBoard = boards.find((b) => b.id === activeBoardId);
    if (!activeBoard) return false;
    return activeBoard.boardConfig?.canWrite === true;
  })();

  return (
    <>
      <div className="flex items-center gap-200">
        {pathname.startsWith(`/${clubId}/board`) && canWrite && (
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
          <Link
            href={`/${clubId}/admin`}
            className={cn(
              buttonVariants({ variant: 'secondary', size: 'md' }),
              'typo-button1 text-text-strong gap-100',
            )}
          >
            <Icon src={ExitToAppIcon} alt="exit" size={20} className="text-icon-normal" />
            운영진
          </Link>
        )}
        <button
          type="button"
          aria-label="마이페이지로 이동"
          onClick={() => router.push(`/${clubId}/mypage`)}
          className="cursor-pointer rounded-full"
        >
          <Avatar size={40} type="round">
            {profileImageUrl && (
              <AvatarImage
                key={profileImageUrl}
                src={profileImageUrl}
                alt="avatar"
                className="object-cover"
              />
            )}
            <AvatarFallback />
          </Avatar>
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
