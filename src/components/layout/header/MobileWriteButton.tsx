'use client';

import dynamic from 'next/dynamic';
import { useParams, usePathname } from 'next/navigation';

import { Icon } from '@/components/ui/Icon';
import EditIcon from '@/assets/icons/edit.svg';
import { useWritePost } from '@/hooks/home/useWritePost';
import { useBoardList } from '@/hooks/board/useBoardQuery';
import { useActiveBoardId } from '@/stores/useBoardNavStore';

const CardinalMissingModal = dynamic(() =>
  import('@/components/home/CardinalMissingModal').then((m) => m.CardinalMissingModal),
);
const ProfileIncompleteModal = dynamic(() =>
  import('@/components/home/ProfileIncompleteModal').then((m) => m.ProfileIncompleteModal),
);

function MobileWriteButton() {
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

  if (!pathname.startsWith(`/${clubId}/board`) || !canWrite) return null;

  return (
    <>
      <button
        type="button"
        aria-label="글쓰기"
        onClick={handleWriteClick}
        className="flex items-center justify-center rounded-sm p-200"
      >
        <Icon src={EditIcon} size={24} className="text-icon-normal" />
      </button>
      <CardinalMissingModal open={cardinalModalOpen} onClose={() => setCardinalModalOpen(false)} />
      <ProfileIncompleteModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSkip={handleSkipProfile}
      />
    </>
  );
}

export { MobileWriteButton };
