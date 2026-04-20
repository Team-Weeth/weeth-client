'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { BoardNav, CommentDirtyGuardDialog } from '@/components/board';
import {
  useActiveBoardId,
  useSetActiveBoardId,
  useSetBoardTypeMap,
} from '@/stores/useBoardNavStore';
import { useClubId } from '@/stores/useClubStore';
import { useCommentDirty, useSetCommentDirty } from '@/stores/useCommentDirtyStore';
import { boardApi } from '@/lib/apis/board';
import type { BoardNavItem, BoardType } from '@/types/board';

interface BoardNavClientProps {
  items: BoardNavItem[];
}

function BoardNavClient({ items }: BoardNavClientProps) {
  const activeBoardId = useActiveBoardId();
  const setActiveBoardId = useSetActiveBoardId();
  const setBoardTypeMap = useSetBoardTypeMap();
  const pathname = usePathname();
  const router = useRouter();

  const clubId = useClubId();
  const isDetailPage = /^\/board\/\d+$/.test(pathname);

  const commentDirty = useCommentDirty();
  const setCommentDirty = useSetCommentDirty();
  const [guardOpen, setGuardOpen] = useState(false);
  const pendingSelect = useRef<number | null>(null);

  useEffect(() => {
    const map: Record<number, BoardType> = {};
    items.forEach((item) => {
      if (item.id !== null) map[item.id] = item.type;
    });
    setBoardTypeMap(map);
  }, [items, setBoardTypeMap]);

  useEffect(() => {
    if (activeBoardId === null) return;
    const exists = items.some((item) => item.id === activeBoardId);
    if (!exists) {
      setActiveBoardId(null);
    }
  }, [items, activeBoardId, setActiveBoardId]);

  const executeSelect = (id: number | null) => {
    setActiveBoardId(id);

    const selected = items.find((item) => item.id === id);
    if (selected?.type === 'NOTICE' && clubId && id !== null) {
      boardApi.readAllNotices(clubId, id).catch(() => {});
    }

    if (isDetailPage) {
      router.push('/board');
    }
  };

  const handleItemSelect = (id: number | null) => {
    if (isDetailPage && commentDirty) {
      pendingSelect.current = id;
      setGuardOpen(true);
      return;
    }

    executeSelect(id);
  };

  const handleGuardConfirm = () => {
    setCommentDirty(false);
    setGuardOpen(false);
    executeSelect(pendingSelect.current);
    pendingSelect.current = null;
  };

  const handleGuardCancel = () => {
    setGuardOpen(false);
    pendingSelect.current = null;
  };

  return (
    <>
      <BoardNav items={items} activeId={activeBoardId} onItemSelect={handleItemSelect} />

      <CommentDirtyGuardDialog
        open={guardOpen}
        onConfirm={handleGuardConfirm}
        onCancel={handleGuardCancel}
      />
    </>
  );
}

export { BoardNavClient };
