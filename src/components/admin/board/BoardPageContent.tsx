'use client';

import { Fragment, useState, useSyncExternalStore } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';

import { Icon, Skeleton } from '@/components/ui';
import { InfoCircleIcon } from '@/assets/icons';
import { BoardCard } from '@/components/admin/board/BoardCard';
import { BoardCardSkeleton } from '@/components/admin/board/BoardCardSkeleton';
import { BoardToolbar } from '@/components/admin/board/BoardToolbar';
import { CreateBoardModal } from '@/components/admin/board/modal/CreateBoardModal';
import { EditBoardModal } from '@/components/admin/board/modal/EditBoardModal';
// TODO: 휴지통 API 정상화되면 TrashBoardModal import 복원
import { useBoardDragReorder } from '@/hooks/admin';
import { useAdminBoardsQuery } from '@/hooks/queries/admin/useAdminBoardsQuery';
import { useCreateBoardMutation } from '@/hooks/queries/admin/useCreateBoardMutation';
import { useUpdateBoardMutation } from '@/hooks/queries/admin/useUpdateBoardMutation';
import { useDeleteBoardMutation } from '@/hooks/queries/admin/useDeleteBoardMutation';
import { useUpdateBoardOrderMutation } from '@/hooks/queries/admin/useUpdateBoardOrderMutation';
import { adminBoardQueryKeys } from '@/hooks/queries/admin/boardQueryKeys';
import { ADMIN_BOARD_ERROR, getApiErrorCode, getApiErrorMessage } from '@/lib/apis/adminBoard';
import { useClubId } from '@/stores';
import { toastError } from '@/stores/useToastStore';
import { toApiPermission } from '@/utils/admin/boardMapper';
import { MAX_CUSTOM_BOARDS } from '@/constants/admin/board.constants';
import type { Board, BoardListCache } from '@/types/admin/board';
import type { BoardFormData } from '@/components/admin/board/modal/constants';
import { SortableBoardCard } from './SortableBoardCard';
import { BoardAdminSkeleton } from './BoardAdminSkeleton';

function subscribeMounted() {
  return () => {};
}

function BoardPageContent() {
  const clubId = useClubId();
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminBoardsQuery();
  const [searchValue, setSearchValue] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createNameError, setCreateNameError] = useState<string | null>(null);
  const [editingBoardId, setEditingBoardId] = useState<number | null>(null);
  const [editNameError, setEditNameError] = useState<string | null>(null);
  const mounted = useSyncExternalStore(
    subscribeMounted,
    () => true,
    () => false,
  );
  // TODO: 휴지통 API 정상화되면 복원
  // const [trashModalOpen, setTrashModalOpen] = useState(false);

  const cacheKey = adminBoardQueryKeys.list(clubId);
  const updateCache = (updater: (prev: BoardListCache) => BoardListCache) => {
    queryClient.setQueryData<BoardListCache>(cacheKey, (prev) => (prev ? updater(prev) : prev));
  };

  const { mutate: updateBoardOrder } = useUpdateBoardOrderMutation();
  const { handleDragStart, handleDragEnd } = useBoardDragReorder({ onReorder: updateBoardOrder });

  const { mutate: createBoard } = useCreateBoardMutation({
    onSuccess: () => setCreateModalOpen(false),
    onError: (err) => {
      const code = getApiErrorCode(err);
      if (code === ADMIN_BOARD_ERROR.DUPLICATE_NAME) {
        setCreateNameError('같은 이름의 게시판이 이미 있어요.');
      } else {
        toastError(getApiErrorMessage(err));
      }
    },
  });

  const { mutate: updateBoard } = useUpdateBoardMutation({
    onSuccess: () => setEditingBoardId(null),
    onError: (err) => {
      const code = getApiErrorCode(err);
      if (code === ADMIN_BOARD_ERROR.DUPLICATE_NAME) {
        setEditNameError('같은 이름의 게시판이 이미 있어요.');
      } else {
        toastError(getApiErrorMessage(err));
      }
    },
  });

  const { mutate: deleteBoard } = useDeleteBoardMutation({
    onSuccess: () => setEditingBoardId(null),
    onError: (err) => {
      const code = getApiErrorCode(err);
      if (code === ADMIN_BOARD_ERROR.BOARD_NOT_FOUND) {
        toastError('이미 삭제된 게시판이에요.');
      } else {
        toastError(getApiErrorMessage(err));
      }
    },
  });

  const { mutate: toggleComment } = useUpdateBoardMutation({
    onError: (err) => toastError(getApiErrorMessage(err)),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (isLoading || !data) return <BoardAdminSkeleton />;

  const { boards } = data;

  const handleCreateBoard = (formData: BoardFormData) => {
    setCreateNameError(null);
    createBoard({
      name: formData.name.trim(),
      description: formData.description.trim(),
      type: 'GENERAL',
      commentEnabled: formData.commentEnabled,
      ...toApiPermission(formData.visibility),
    });
  };

  const handleToggleComments = (boardId: number, next: boolean) => {
    const target = boards.find((b) => b.boardId === boardId);
    if (!target) return;

    const snapshot = queryClient.getQueryData<BoardListCache>(cacheKey);

    updateCache((prev) => ({
      ...prev,
      boards: prev.boards.map((b) => (b.boardId === boardId ? { ...b, commentEnabled: next } : b)),
    }));

    toggleComment(
      {
        boardId,
        body: {
          name: target.name,
          description: target.description,
          commentEnabled: next,
          ...toApiPermission(target.visibility),
        },
      },
      {
        onError: () => {
          queryClient.setQueryData(cacheKey, snapshot);
        },
      },
    );
  };

  const handleMoveToTrash = (board: Board) => {
    deleteBoard(board.boardId);
  };

  // TODO: 휴지통 API 정상화되면 복원
  // const handleRestoreFromTrash = (boardId: number) => {
  //   updateCache((prev) => {
  //     const trashed = prev.trashedBoards.find((b) => b.boardId === boardId);
  //     if (!trashed) return prev;
  //     const restored: Board = {
  //       boardId: trashed.boardId,
  //       name: trashed.name,
  //       description: trashed.description,
  //       kind: trashed.kind,
  //       visibility: trashed.visibility,
  //       postCount: trashed.postCount,
  //       commentEnabled: trashed.commentEnabled,
  //       editable: trashed.editable,
  //     };
  //     return {
  //       boards: [...prev.boards, restored],
  //       trashedBoards: prev.trashedBoards.filter((b) => b.boardId !== boardId),
  //     };
  //   });
  // };
  //
  // const handlePermanentDelete = (boardId: number) => {
  //   updateCache((prev) => ({
  //     ...prev,
  //     trashedBoards: prev.trashedBoards.filter((b) => b.boardId !== boardId),
  //   }));
  // };

  const query = searchValue.trim().toLowerCase();
  const filteredBoards = query
    ? boards.filter((b) => b.name.toLowerCase().includes(query))
    : boards;

  const fixedBoards = filteredBoards.filter((b) => !b.editable);
  const customBoards = filteredBoards.filter((b) => b.editable);
  const totalCustomCount = boards.filter((b) => b.editable).length;
  const reachedLimit = totalCustomCount >= MAX_CUSTOM_BOARDS;

  const editingBoard =
    editingBoardId !== null ? (boards.find((b) => b.boardId === editingBoardId) ?? null) : null;

  return (
    <div className="flex min-w-0 flex-col gap-400 p-700">
      <BoardToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        // TODO: 휴지통 API 정상화되면 복원
        // trashCount={trashedBoards.length}
        // onTrashClick={() => setTrashModalOpen(true)}
        onCreateClick={
          reachedLimit
            ? () => toastError(`추가 게시판은 최대 ${MAX_CUSTOM_BOARDS}개까지 만들 수 있어요.`)
            : () => setCreateModalOpen(true)
        }
      />

      <div className="flex flex-col gap-400">
        {fixedBoards.length > 0 && (
          <div className="flex flex-col gap-400">
            {fixedBoards.map((board, index) => (
              <Fragment key={board.boardId}>
                {index > 0 && <div className="border-line w-full border-t" />}
                <BoardCard
                  board={board}
                  draggable={false}
                  onToggleComments={(next) => handleToggleComments(board.boardId, next)}
                />
              </Fragment>
            ))}
          </div>
        )}

        {fixedBoards.length > 0 && customBoards.length > 0 && (
          <div className="border-line w-full border-t" />
        )}

        {customBoards.length > 0 &&
          (query || !mounted ? (
            <div className="flex flex-col gap-200">
              {customBoards.map((board) => (
                <BoardCard
                  key={board.boardId}
                  board={board}
                  draggable={false}
                  onToggleComments={(next) => handleToggleComments(board.boardId, next)}
                  onEdit={() => setEditingBoardId(board.boardId)}
                  onDelete={() => handleMoveToTrash(board)}
                />
              ))}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={customBoards.map((b) => b.boardId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-200">
                  {customBoards.map((board) => (
                    <SortableBoardCard
                      key={board.boardId}
                      board={board}
                      onToggleComments={(next) => handleToggleComments(board.boardId, next)}
                      onEdit={() => setEditingBoardId(board.boardId)}
                      onDelete={() => handleMoveToTrash(board)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ))}

        <div className="bg-container-neutral-alternative flex h-12 items-center gap-200 rounded-md p-300">
          <Icon src={InfoCircleIcon} size={20} className="text-icon-alternative" />
          <p className="typo-body2 text-text-alternative min-w-0 flex-1">
            추가 게시판은 최대 {MAX_CUSTOM_BOARDS}개입니다.
          </p>
        </div>
      </div>

      <CreateBoardModal
        open={createModalOpen}
        onOpenChange={(open) => {
          setCreateModalOpen(open);
          if (!open) setCreateNameError(null);
        }}
        onSubmit={handleCreateBoard}
        nameError={createNameError}
        onNameChange={() => setCreateNameError(null)}
      />

      {/* TODO: 휴지통 API 정상화되면 복원
      <TrashBoardModal
        open={trashModalOpen}
        onOpenChange={setTrashModalOpen}
        boards={trashedBoards}
        onRestore={handleRestoreFromTrash}
        onPermanentDelete={handlePermanentDelete}
      />
      */}

      <EditBoardModal
        open={editingBoardId !== null}
        onOpenChange={(next) => {
          if (!next) {
            setEditingBoardId(null);
            setEditNameError(null);
          }
        }}
        board={editingBoard}
        onSubmit={(formData) => {
          if (editingBoardId === null) return;
          setEditNameError(null);
          updateBoard({
            boardId: editingBoardId,
            body: {
              name: formData.name.trim(),
              description: formData.description.trim(),
              commentEnabled: formData.commentEnabled,
              ...toApiPermission(formData.visibility),
            },
          });
        }}
        onDelete={(board) => deleteBoard(board.boardId)}
        nameError={editNameError}
        onNameChange={() => setEditNameError(null)}
      />
    </div>
  );
}

export { BoardPageContent };
