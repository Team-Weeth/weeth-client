import { renderHook, waitFor } from '@testing-library/react';

import { useAdminBoardsQuery } from '@/hooks/queries/admin/useAdminBoardsQuery';
import { adminBoardApi } from '@/lib/apis/adminBoard';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import type { AdminBoardDto, AdminBoardListDto } from '@/lib/apis/adminBoard';

jest.mock('@/lib/apis/adminBoard', () => ({
  adminBoardApi: { getBoards: jest.fn() },
}));
jest.mock('@/stores', () => ({ useClubId: () => 'club-1' }));

const getBoardsMock = jest.mocked(adminBoardApi.getBoards);

function createBoard(overrides: Partial<AdminBoardDto> & Pick<AdminBoardDto, 'id'>): AdminBoardDto {
  return {
    name: `게시판${overrides.id}`,
    description: '',
    type: 'GENERAL',
    commentEnabled: true,
    writePermission: 'USER',
    isPrivate: false,
    displayOrder: overrides.id,
    postCount: 0,
    isDeleted: false,
    ...overrides,
  };
}

function mockBoardsResponse(data: AdminBoardListDto) {
  getBoardsMock.mockResolvedValue({ data: { code: 200, message: 'OK', data } } as never);
}

function renderBoardsQuery() {
  return renderHook(() => useAdminBoardsQuery(), {
    wrapper: createWrapper(createQueryClient()),
  });
}

it('게시판을 표시 순서로 정렬하고 서버가 계산한 상한 메타데이터를 그대로 반환한다', async () => {
  mockBoardsResponse({
    boards: [
      createBoard({ id: 2, name: '자유', displayOrder: 2 }),
      createBoard({
        id: 1,
        name: '공지',
        type: 'NOTICE',
        writePermission: 'ADMIN',
        displayOrder: 1,
      }),
    ],
    activeBoardCount: 1,
    maxBoardCount: 3,
    canCreateBoard: true,
  });

  const { result } = renderBoardsQuery();

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toMatchObject({
    activeBoardCount: 1,
    maxBoardCount: 3,
    canCreateBoard: true,
  });
  expect(result.current.data?.boards.map((board) => board.name)).toEqual(['공지', '자유']);
});

it('서버가 생성을 막으면 canCreateBoard를 그대로 false로 전달한다', async () => {
  mockBoardsResponse({
    boards: [1, 2, 3].map((id) => createBoard({ id })),
    activeBoardCount: 3,
    maxBoardCount: 3,
    canCreateBoard: false,
  });

  const { result } = renderBoardsQuery();

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toMatchObject({
    activeBoardCount: 3,
    maxBoardCount: 3,
    canCreateBoard: false,
  });
});

it('삭제된 게시판은 목록에서 빼되 서버가 준 개수는 건드리지 않는다', async () => {
  mockBoardsResponse({
    boards: [createBoard({ id: 1, name: '자유' }), createBoard({ id: 2, isDeleted: true })],
    activeBoardCount: 1,
    maxBoardCount: 3,
    canCreateBoard: true,
  });

  const { result } = renderBoardsQuery();

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.boards.map((board) => board.name)).toEqual(['자유']);
  expect(result.current.data?.activeBoardCount).toBe(1);
});
