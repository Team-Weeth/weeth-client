import { validatePost } from '../validatePost';
import type { UploadFileItem } from '@/stores/usePostStore';

jest.mock('@/stores/useToastStore', () => ({ toast: jest.fn() }));

const { toast } = jest.requireMock('@/stores/useToastStore') as { toast: jest.Mock };

function makeFile(overrides: Partial<UploadFileItem> = {}): UploadFileItem {
  return {
    id: '1',
    fileName: 'test.png',
    fileUrl: 'https://example.com/test.png',
    storageKey: 'key/test.png',
    fileSize: 1024,
    contentType: 'image/png',
    uploaded: true,
    ...overrides,
  };
}

const VALID: Parameters<typeof validatePost>[0] = {
  clubId: '42',
  title: '테스트 제목',
  content: '<p>본문 내용</p>',
  files: [],
};

describe('validatePost', () => {
  beforeEach(() => {
    toast.mockClear();
  });

  // ──────────────────────────────────────────────
  // clubId 검증
  // ──────────────────────────────────────────────
  describe('clubId', () => {
    it('null이면 false를 반환하고 error toast를 호출한다', () => {
      expect(validatePost({ ...VALID, clubId: null })).toBe(false);
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' }));
    });
  });

  // ──────────────────────────────────────────────
  // title 검증
  // ──────────────────────────────────────────────
  describe('title', () => {
    it('빈 문자열이면 false를 반환한다', () => {
      expect(validatePost({ ...VALID, title: '' })).toBe(false);
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' }));
    });

    it('공백만 있는 제목은 false를 반환한다 (trim 적용)', () => {
      expect(validatePost({ ...VALID, title: '   ' })).toBe(false);
    });

    it('공백이 아닌 문자가 있으면 통과한다', () => {
      expect(validatePost({ ...VALID, title: ' 제목 ' })).toBe(true);
      expect(toast).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────
  // content 검증
  // ──────────────────────────────────────────────
  describe('content', () => {
    it('빈 HTML 태그(<p></p>)만 있으면 false를 반환한다', () => {
      expect(validatePost({ ...VALID, content: '<p></p>' })).toBe(false);
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' }));
    });

    it('빈 문자열이면 false를 반환한다', () => {
      expect(validatePost({ ...VALID, content: '' })).toBe(false);
    });

    it('텍스트가 있는 HTML이면 통과한다', () => {
      expect(validatePost({ ...VALID, content: '<h1>제목</h1><p>내용</p>' })).toBe(true);
    });
  });

  // ──────────────────────────────────────────────
  // files 검증
  // ──────────────────────────────────────────────
  describe('files', () => {
    it('uploaded=false이고 file 객체가 있으면 업로드 중으로 간주해 false를 반환한다', () => {
      const uploading = makeFile({ uploaded: false, file: new File([''], 'img.png') });
      expect(validatePost({ ...VALID, files: [uploading] })).toBe(false);
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' }));
    });

    it('업로드가 완료된 파일(uploaded=true)은 통과한다', () => {
      const done = makeFile({ uploaded: true });
      expect(validatePost({ ...VALID, files: [done] })).toBe(true);
    });

    it('file 프로퍼티가 없는 항목(기존 서버 파일)은 업로드 중으로 간주하지 않는다', () => {
      const existing = makeFile({ uploaded: false, file: undefined });
      expect(validatePost({ ...VALID, files: [existing] })).toBe(true);
    });
  });

  // ──────────────────────────────────────────────
  // 전체 통과
  // ──────────────────────────────────────────────
  it('모든 조건이 충족되면 true를 반환하고 toast를 호출하지 않는다', () => {
    expect(validatePost(VALID)).toBe(true);
    expect(toast).not.toHaveBeenCalled();
  });
});
