import {
  toDisplayFile,
  isImageFileByType,
  stripUuidPrefix,
  mapComment,
  toBoardNavItem,
  buildPostPath,
  buildBoardPath,
} from '@/lib/board';
import type { FileItem, PostComment, PostAuthor } from '@/types/board';

function makeAuthor(overrides: Partial<PostAuthor> = {}): PostAuthor {
  return {
    id: 1,
    name: '작성자',
    profileImageUrl: 'https://example.com/avatar.jpg',
    role: 'USER',
    ...overrides,
  };
}

function makeComment(overrides: Partial<PostComment> = {}): PostComment {
  return {
    id: 100,
    author: makeAuthor(),
    content: '댓글 내용',
    time: '2026-03-20T14:30:00',
    fileUrls: [],
    children: [],
    ...overrides,
  };
}

describe('toDisplayFile', () => {
  it('fileId를 id로, fileName·fileUrl을 그대로 매핑한다', () => {
    const file: FileItem = {
      fileId: 42,
      fileName: 'photo.jpg',
      fileUrl: 'https://example.com/photo.jpg',
      storageKey: 'key-1',
      fileSize: 1024,
      contentType: 'image/jpeg',
      status: 'UPLOADED',
    };

    expect(toDisplayFile(file)).toEqual({
      id: 42,
      fileName: 'photo.jpg',
      fileUrl: 'https://example.com/photo.jpg',
    });
  });
});

describe('isImageFileByType', () => {
  it.each([
    ['image/jpeg', true],
    ['image/png', true],
    ['image/gif', true],
    ['video/mp4', false],
    ['application/pdf', false],
    ['text/plain', false],
  ])('contentType "%s" → %s', (contentType, expected) => {
    expect(isImageFileByType(contentType)).toBe(expected);
  });
});

describe('stripUuidPrefix', () => {
  it('UUID_원본파일명에서 UUID 접두사를 제거한다', () => {
    expect(stripUuidPrefix('abc123_photo.jpg')).toBe('photo.jpg');
  });

  it('언더바가 없으면 원본 문자열을 반환한다', () => {
    expect(stripUuidPrefix('nounderscore')).toBe('nounderscore');
  });

  it('첫 번째 언더바까지만 제거한다', () => {
    expect(stripUuidPrefix('uuid_my_file.jpg')).toBe('my_file.jpg');
  });
});

describe('mapComment', () => {
  describe('isDeleted', () => {
    it('isDeleted 플래그가 true이면 isDeleted=true다', () => {
      const comment = makeComment({ isDeleted: true });
      expect(mapComment(comment, null).isDeleted).toBe(true);
    });

    it('content가 "삭제된 댓글입니다."이면 isDeleted=true다', () => {
      const comment = makeComment({ content: '삭제된 댓글입니다.' });
      expect(mapComment(comment, null).isDeleted).toBe(true);
    });

    it('isDeleted 플래그가 false이면 content와 무관하게 isDeleted=false다', () => {
      const comment = makeComment({ isDeleted: false, content: '삭제된 댓글입니다.' });
      expect(mapComment(comment, null).isDeleted).toBe(false);
    });

    it('일반 댓글은 isDeleted=false다', () => {
      const comment = makeComment({ content: '일반 댓글' });
      expect(mapComment(comment, null).isDeleted).toBe(false);
    });
  });

  describe('isAuthor', () => {
    it('currentUserId가 author.id와 일치하면 isAuthor=true다', () => {
      const comment = makeComment({ author: makeAuthor({ id: 5 }) });
      expect(mapComment(comment, 5).isAuthor).toBe(true);
    });

    it('currentUserId가 null이면 isAuthor=false다', () => {
      const comment = makeComment({ author: makeAuthor({ id: 5 }) });
      expect(mapComment(comment, null).isAuthor).toBe(false);
    });

    it('currentUserId가 author.id와 다르면 isAuthor=false다', () => {
      const comment = makeComment({ author: makeAuthor({ id: 5 }) });
      expect(mapComment(comment, 99).isAuthor).toBe(false);
    });

    it('isDeleted=true이면 userId가 일치해도 isAuthor=false다', () => {
      const comment = makeComment({ author: makeAuthor({ id: 5 }), isDeleted: true });
      expect(mapComment(comment, 5).isAuthor).toBe(false);
    });
  });

  it('date를 formatShortDateTime 형식으로 변환한다', () => {
    const comment = makeComment({ time: '2026-03-20T14:30:00' });
    expect(mapComment(comment, null).date).toBe('03/20 14:30');
  });

  it('children을 재귀적으로 매핑한다', () => {
    const reply = makeComment({ id: 200, content: '답글 내용' });
    const comment = makeComment({ children: [reply] });

    const mapped = mapComment(comment, null);
    expect(mapped.replies).toHaveLength(1);
    expect(mapped.replies[0].id).toBe(200);
    expect(mapped.replies[0].content).toBe('답글 내용');
  });

  it('기본 필드를 올바르게 매핑한다', () => {
    const comment = makeComment({
      id: 100,
      author: makeAuthor({ id: 1, name: '홍길동', profileImageUrl: 'https://img.com/1.jpg' }),
      content: '댓글 내용',
      time: '2026-03-20T14:30:00',
    });

    const mapped = mapComment(comment, 1);
    expect(mapped.id).toBe(100);
    expect(mapped.name).toBe('홍길동');
    expect(mapped.profileImage).toBe('https://img.com/1.jpg');
    expect(mapped.content).toBe('댓글 내용');
  });
});

describe('toBoardNavItem', () => {
  it('board를 BoardNavItem으로 변환한다', () => {
    const board = {
      id: 2,
      name: '공지사항',
      type: 'NOTICE' as const,
      boardConfig: { canWrite: false, canComment: false },
    };

    expect(toBoardNavItem(board)).toEqual({
      id: 2,
      label: '공지사항',
      type: 'NOTICE',
      canWrite: false,
    });
  });

  it('boardConfig가 없으면 canWrite가 undefined다', () => {
    const board = { id: null, name: '전체', type: 'ALL' as const };

    expect(toBoardNavItem(board)).toEqual({
      id: null,
      label: '전체',
      type: 'ALL',
      canWrite: undefined,
    });
  });
});

describe('buildPostPath', () => {
  it('/clubId/board/boardId/postId 형식으로 반환한다', () => {
    expect(buildPostPath('club-1', 42, 10)).toBe('/club-1/board/10/42');
  });
});

describe('buildBoardPath', () => {
  it('/clubId/board/boardId 형식으로 반환한다', () => {
    expect(buildBoardPath('club-1', 10)).toBe('/club-1/board/10');
  });
});
