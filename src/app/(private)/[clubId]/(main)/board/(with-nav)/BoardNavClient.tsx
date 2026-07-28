'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';

import { BoardNav, CategorySelector, CommentDirtyGuardDialog } from '@/components/board';
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
  // footer: ReactNode;
}

function BoardNavClient({ items }: BoardNavClientProps) {
  const activeBoardId = useActiveBoardId();
  const setActiveBoardId = useSetActiveBoardId();
  const setBoardTypeMap = useSetBoardTypeMap();
  const pathname = usePathname();
  const router = useRouter();
  const { clubId: clubIdParam, boardId: boardIdParam } = useParams<{
    clubId: string;
    boardId?: string;
  }>();

  const clubId = useClubId();
  const isDetailPage = /\/board\/\d+\/\d+$/.test(pathname);
  const isPostsRoute = /\/board\/posts\/\d+$/.test(pathname);

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

  // URL의 boardId 파라미터로 활성 채널 동기화
  useEffect(() => {
    if (boardIdParam) {
      const boardId = Number(boardIdParam);
      if (Number.isInteger(boardId)) {
        if (boardId !== activeBoardId) setActiveBoardId(boardId);
      } else if (activeBoardId !== null) {
        // 유효하지 않은 boardIdParam → stale 방지를 위해 리셋
        setActiveBoardId(null);
      }
    } else if (!isDetailPage && !isPostsRoute) {
      // /board (전체 게시글) 페이지일 때
      // posts/ 경로는 PostDetailContent가 boardId를 설정하므로 리셋하지 않음
      if (activeBoardId !== null) {
        setActiveBoardId(null);
      }
    }
  }, [boardIdParam, activeBoardId, setActiveBoardId, isDetailPage, isPostsRoute]);

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

    if (id === null) {
      router.push(`/${clubIdParam}/board`);
    } else {
      router.push(`/${clubIdParam}/board/${id}`);
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
      {/* Mobile: CategorySelector 드롭다운 (tablet 이상에서 숨김) */}
      <div className="tablet:hidden">
        <CategorySelector
          className="shadow-[0_5px_20px_rgba(17,33,49,0.2)]"
          items={items}
          activeId={activeBoardId}
          onItemSelect={handleItemSelect}
          filterAll={false}
        />
      </div>

      {/* Tablet+: 사이드바 (mobile에서 숨김) */}
      <aside className="tablet:flex hidden shrink-0 flex-col gap-400">
        <BoardNav items={items} activeId={activeBoardId} onItemSelect={handleItemSelect} />
        {/* {footer} */}
      </aside>

      <CommentDirtyGuardDialog
        open={guardOpen}
        onConfirm={handleGuardConfirm}
        onCancel={handleGuardCancel}
      />
    </>
  );
}

export { BoardNavClient };
