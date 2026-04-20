'use client';

import { Fragment, useState } from 'react';
import Image from 'next/image';

import {
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@/components/ui';
import { ArrowDownIcon, InfoIcon } from '@/assets/icons';
import { BoardCard } from '@/components/admin/board/BoardCard';
import { BoardToolbar } from '@/components/admin/board/BoardToolbar';
import { CreateBoardModal } from '@/components/admin/board/modal/CreateBoardModal';
import { useCardinals } from '@/hooks/queries';
import type { Board } from '@/types/admin/board';

const MAX_CUSTOM_BOARDS = 3;

// TODO: API 연동 전 임시 데이터
const MOCK_BOARDS: Board[] = [
  {
    boardId: 1,
    name: '전체 게시판',
    description: '모든 게시글을 확인할 수 있는 게시판입니다.',
    kind: 'ALL',
    visibility: 'PUBLIC',
    postCount: 32,
    commentEnabled: null,
    editable: false,
  },
  {
    boardId: 2,
    name: '공지',
    description: '운영진이 공지사항을 올리는 게시판입니다.',
    kind: 'NOTICE',
    visibility: 'ADMIN_ONLY',
    postCount: 32,
    commentEnabled: true,
    editable: false,
  },
  {
    boardId: 3,
    name: '자유 게시판',
    description: '모든 게시글을 확인할 수 있는 게시판입니다.',
    kind: 'CUSTOM',
    visibility: 'PUBLIC',
    postCount: 32,
    commentEnabled: true,
    editable: true,
  },
  {
    boardId: 4,
    name: '자유 게시판',
    description: '모든 게시글을 확인할 수 있는 게시판입니다.',
    kind: 'CUSTOM',
    visibility: 'PUBLIC',
    postCount: 32,
    commentEnabled: true,
    editable: true,
  },
];

const MOCK_TRASH_COUNT = 1;

function BoardPageContent() {
  const { data: cardinals = [] } = useCardinals();
  const [selectedCardinalId, setSelectedCardinalId] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [boards, setBoards] = useState<Board[]>(MOCK_BOARDS);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const activeCardinal = selectedCardinalId
    ? cardinals.find((c) => c.id === selectedCardinalId)
    : undefined;

  const query = searchValue.trim().toLowerCase();
  const filteredBoards = query
    ? boards.filter((b) => b.name.toLowerCase().includes(query))
    : boards;

  const fixedBoards = filteredBoards.filter((b) => !b.editable);
  const customBoards = filteredBoards.filter((b) => b.editable);
  const reachedLimit = customBoards.length >= MAX_CUSTOM_BOARDS;

  const updateBoard = (boardId: number, patch: Partial<Board>) => {
    setBoards((prev) => prev.map((b) => (b.boardId === boardId ? { ...b, ...patch } : b)));
  };

  return (
    <div className="flex min-w-0 flex-col gap-400 p-700">
      {/* Cardinal filter */}
      <Card className="w-fit">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="border-line flex cursor-pointer items-center gap-700 rounded-sm border py-300 pr-300 pl-400"
            >
              <span className="typo-sub2 text-text-normal w-12 text-left">
                {activeCardinal ? `${activeCardinal.cardinalNumber}기` : '기수'}
              </span>
              <Image src={ArrowDownIcon} alt="기수 선택" width={24} height={24} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {cardinals.map((c) => (
              <DropdownMenuItem key={c.id} onSelect={() => setSelectedCardinalId(c.id)}>
                {c.cardinalNumber}기
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>

      {/* Toolbar: search + trash + create */}
      <BoardToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        trashCount={MOCK_TRASH_COUNT}
        onCreateClick={reachedLimit ? undefined : () => setCreateModalOpen(true)}
      />

      {/* Board list */}
      <div className="flex flex-col gap-400">
        {/* Fixed (system) boards */}
        {fixedBoards.length > 0 && (
          <div className="flex flex-col gap-400">
            {fixedBoards.map((board, index) => (
              <Fragment key={board.boardId}>
                {index > 0 && <div className="border-line w-full border-t" />}
                <BoardCard
                  board={board}
                  draggable={false}
                  onToggleComments={(next) => updateBoard(board.boardId, { commentEnabled: next })}
                />
              </Fragment>
            ))}
          </div>
        )}

        {fixedBoards.length > 0 && customBoards.length > 0 && (
          <div className="border-line w-full border-t" />
        )}

        {/* Custom boards */}
        {customBoards.length > 0 && (
          <div className="flex flex-col gap-200">
            {customBoards.map((board) => (
              <BoardCard
                key={board.boardId}
                board={board}
                onToggleComments={(next) => updateBoard(board.boardId, { commentEnabled: next })}
              />
            ))}
          </div>
        )}

        {/* Limit banner */}
        <div className="bg-container-neutral-alternative flex h-12 items-center gap-200 rounded-md p-300">
          <Icon src={InfoIcon} size={20} className="text-icon-alternative" />
          <p className="typo-body2 text-text-alternative min-w-0 flex-1">
            추가 게시판은 최대 {MAX_CUSTOM_BOARDS}개입니다.
          </p>
        </div>
      </div>

      {/* Create board modal */}
      <CreateBoardModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={(data) => {
          setBoards((prev) => [
            ...prev,
            {
              boardId: Math.max(0, ...prev.map((b) => b.boardId)) + 1,
              name: data.name.trim(),
              description: data.description.trim(),
              kind: 'CUSTOM',
              visibility: data.visibility,
              postCount: 0,
              commentEnabled: data.commentEnabled,
              editable: true,
            },
          ]);
        }}
      />
    </div>
  );
}

export { BoardPageContent };
