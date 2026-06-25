import { resolveFilesPayload } from '../resolveFilesPayload';
import type { UploadFileItem } from '@/stores/usePostStore';

function makeFile(overrides: Partial<UploadFileItem> = {}): UploadFileItem {
  return {
    id: 'file-1',
    fileName: 'test.png',
    fileUrl: 'https://example.com/test.png',
    storageKey: 'key/test.png',
    fileSize: 1024,
    contentType: 'image/png',
    uploaded: true,
    isExisting: false,
    ...overrides,
  };
}

describe('resolveFilesPayload', () => {
  // ──────────────────────────────────────────────
  // 작성 모드: snapshotFileIds === null
  // ──────────────────────────────────────────────
  describe('작성 모드 (snapshotFileIds === null)', () => {
    it('모든 파일을 CreatePostFile 형식(4개 필드)으로 매핑해 반환한다', () => {
      const files = [
        makeFile({
          id: '1',
          fileName: 'a.png',
          storageKey: 'k/a',
          fileSize: 100,
          contentType: 'image/png',
        }),
        makeFile({
          id: '2',
          fileName: 'b.pdf',
          storageKey: 'k/b',
          fileSize: 200,
          contentType: 'application/pdf',
        }),
      ];

      expect(resolveFilesPayload(files, null)).toEqual([
        { fileName: 'a.png', storageKey: 'k/a', fileSize: 100, contentType: 'image/png' },
        { fileName: 'b.pdf', storageKey: 'k/b', fileSize: 200, contentType: 'application/pdf' },
      ]);
    });

    it('파일이 없으면 빈 배열을 반환한다', () => {
      expect(resolveFilesPayload([], null)).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────
  // 수정 모드: snapshotFileIds !== null
  // ──────────────────────────────────────────────
  describe('수정 모드 (snapshotFileIds !== null)', () => {
    it('파일 변경이 없으면 null을 반환한다', () => {
      const files = [
        makeFile({ id: 'a', isExisting: true }),
        makeFile({ id: 'b', isExisting: true }),
      ];
      expect(resolveFilesPayload(files, ['a', 'b'])).toBeNull();
    });

    it('파일이 없고 snapshot도 비어 있으면 null을 반환한다', () => {
      expect(resolveFilesPayload([], [])).toBeNull();
    });

    it('기존 파일 순서가 달라도 내용이 같으면 null을 반환한다', () => {
      const files = [
        makeFile({ id: 'b', isExisting: true }),
        makeFile({ id: 'a', isExisting: true }),
      ];
      expect(resolveFilesPayload(files, ['a', 'b'])).toBeNull();
    });

    it('새 파일이 추가됐으면 전체 파일 목록을 반환한다', () => {
      const files = [
        makeFile({ id: 'a', isExisting: true }),
        makeFile({ id: 'new', isExisting: false, fileName: 'new.png' }),
      ];
      const result = resolveFilesPayload(files, ['a']);
      expect(result).not.toBeNull();
      expect(result).toHaveLength(2);
    });

    it('기존 파일이 삭제됐으면 남은 파일 목록을 반환한다', () => {
      const files = [makeFile({ id: 'a', isExisting: true })];
      // snapshot에 'b'가 있었으나 현재 제거됨
      const result = resolveFilesPayload(files, ['a', 'b']);
      expect(result).not.toBeNull();
      expect(result).toHaveLength(1);
    });

    it('모든 기존 파일이 삭제되고 새 파일로 교체됐으면 새 파일 목록을 반환한다', () => {
      const files = [makeFile({ id: 'new', isExisting: false })];
      const result = resolveFilesPayload(files, ['old-a', 'old-b']);
      expect(result).not.toBeNull();
      expect(result).toHaveLength(1);
    });
  });
});
