import {
  isReferencedInContent,
  isFileReferencedInContent,
  getUnreferencedFiles,
} from '@/lib/board/getUnreferencedFiles';
import type { FileItem } from '@/types/file';

function makeFileItem(overrides: Partial<FileItem> = {}): FileItem {
  return {
    fileId: 1,
    fileName: 'test.png',
    fileUrl: 'https://example.com/test.png',
    storageKey: 'key/test.png',
    fileSize: 1024,
    contentType: 'image/png',
    status: 'UPLOADED',
    ...overrides,
  };
}

describe('isReferencedInContent', () => {
  describe('src 속성 매칭', () => {
    it('src="url" 형태로 포함된 경우 true를 반환한다', () => {
      const url = 'https://example.com/image.png';
      expect(isReferencedInContent(url, `<img src="${url}" alt="test" />`)).toBe(true);
    });

    it('data-src="url" 형태로 포함된 경우 true를 반환한다', () => {
      const url = 'https://example.com/image.png';
      expect(isReferencedInContent(url, `<div data-src="${url}"></div>`)).toBe(true);
    });

    it('본문 텍스트에만 URL이 등장하는 경우 false를 반환한다', () => {
      const url = 'https://example.com/image.png';
      expect(isReferencedInContent(url, `<p>링크: ${url}</p>`)).toBe(false);
    });

    it('href 등 다른 속성에 URL이 있어도 false를 반환한다', () => {
      const url = 'https://example.com/image.png';
      expect(isReferencedInContent(url, `<a href="${url}">링크</a>`)).toBe(false);
    });

    it('HTML에 해당 URL이 없으면 false를 반환한다', () => {
      expect(
        isReferencedInContent(
          'https://example.com/a.png',
          '<img src="https://example.com/b.png" />',
        ),
      ).toBe(false);
    });

    it('HTML이 빈 문자열이면 false를 반환한다', () => {
      expect(isReferencedInContent('https://example.com/a.png', '')).toBe(false);
    });
  });

  describe('URL 인코딩 허용', () => {
    it('fileUrl은 리터럴 공백, HTML에 %20으로 인코딩된 경우 true를 반환한다', () => {
      const fileUrl = 'https://example.com/my file.png';
      const html = '<img src="https://example.com/my%20file.png" />';
      expect(isReferencedInContent(fileUrl, html)).toBe(true);
    });

    it('fileUrl이 %20 인코딩, HTML에 리터럴 공백인 경우 true를 반환한다', () => {
      const fileUrl = 'https://example.com/my%20file.png';
      const html = '<img src="https://example.com/my file.png" />';
      expect(isReferencedInContent(fileUrl, html)).toBe(true);
    });

    it('fileUrl은 리터럴 공백·괄호, HTML에 %20·%28·%29로 인코딩된 경우 true를 반환한다', () => {
      const fileUrl = 'https://example.com/my file (1).png';
      const html = '<img src="https://example.com/my%20file%20%281%29.png" />';
      expect(isReferencedInContent(fileUrl, html)).toBe(true);
    });

    it('fileUrl이 %20·%28·%29 인코딩, HTML에 리터럴 문자인 경우 true를 반환한다', () => {
      const fileUrl = 'https://example.com/my%20file%20%281%29.png';
      const html = '<img src="https://example.com/my file (1).png" />';
      expect(isReferencedInContent(fileUrl, html)).toBe(true);
    });

    it('fileUrl에 쿼리와 %20 인코딩, HTML src에 같은 쿼리와 리터럴 공백이 있으면 true를 반환한다', () => {
      const fileUrl = 'https://example.com/my%20file.png?token=abc';
      const html = '<img src="https://example.com/my file.png?token=abc" />';
      expect(isReferencedInContent(fileUrl, html)).toBe(true);
    });

    it('fileUrl에 쿼리와 %28·%29 인코딩, HTML src에 같은 쿼리와 리터럴 괄호가 있으면 true를 반환한다', () => {
      const fileUrl = 'https://example.com/my%20file%20%281%29.png?token=abc';
      const html = '<img src="https://example.com/my file (1).png?token=abc" />';
      expect(isReferencedInContent(fileUrl, html)).toBe(true);
    });
  });

  describe('HTML 엔티티 허용', () => {
    it('fileUrl의 &가 HTML에서 &amp;로 인코딩된 경우 true를 반환한다', () => {
      const fileUrl = 'https://s3.example.com/img?foo=1&bar=2';
      const html = '<img src="https://s3.example.com/img?foo=1&amp;bar=2" />';
      expect(isReferencedInContent(fileUrl, html)).toBe(true);
    });

    it('fileUrl에 &amp;가 리터럴로 포함되어 있고 HTML src에 &만 있어도 base path가 같으면 true를 반환한다', () => {
      const fileUrl = 'https://s3.example.com/img?foo=1&amp;bar=2';
      const html = '<img src="https://s3.example.com/img?foo=1&bar=2" />';
      // 디코딩 비교 단계에서 양쪽 쿼리를 모두 제거하므로 base path(img)가 일치
      expect(isReferencedInContent(fileUrl, html)).toBe(true);
    });
  });
});

describe('isFileReferencedInContent', () => {
  // 운영에서 실제로 확인된 값. 본문에는 업로드에 쓴 S3 주소가 퍼센트 인코딩된 채로 들어가고,
  // 조회 응답의 fileUrl은 CDN 도메인에 인코딩되지 않은 경로로 내려온다.
  const STORAGE_KEY = 'POST/2026-10/41fc98a2_01_ES-Lab00 (1).pdf';
  const CDN_URL = `https://cdn.weeth.kr/${STORAGE_KEY}`;
  const S3_CONTENT =
    '<div data-file-attachment="" data-src="https://weeth-s3-prod.s3.ap-northeast-2.amazonaws.com/POST/2026-10/41fc98a2_01_ES-Lab00%20%281%29.pdf"></div>';

  it('호스트와 인코딩이 달라도 storageKey가 같으면 참조로 판정한다', () => {
    expect(
      isFileReferencedInContent({ fileUrl: CDN_URL, storageKey: STORAGE_KEY }, S3_CONTENT),
    ).toBe(true);
  });

  it('storageKey가 다르면 참조로 판정하지 않는다', () => {
    const other = { fileUrl: CDN_URL, storageKey: 'POST/2026-10/other_file.pdf' };
    expect(isFileReferencedInContent(other, S3_CONTENT)).toBe(false);
  });

  it('storageKey가 없으면 URL 비교로 폴백한다', () => {
    const url = 'https://example.com/image.png';
    expect(isFileReferencedInContent({ fileUrl: url }, `<img src="${url}" />`)).toBe(true);
    expect(isFileReferencedInContent({ fileUrl: url }, '<p>본문</p>')).toBe(false);
  });

  it('본문에 인라인 참조가 없으면 false를 반환한다', () => {
    expect(
      isFileReferencedInContent(
        { fileUrl: CDN_URL, storageKey: STORAGE_KEY },
        '<p>본문만 있음</p>',
      ),
    ).toBe(false);
  });

  it('쿼리스트링이 붙은 presigned URL도 경로로 매칭한다', () => {
    const content = `<img src="https://weeth-s3-prod.s3.ap-northeast-2.amazonaws.com/${STORAGE_KEY}?X-Amz-Signature=abc" />`;
    expect(isFileReferencedInContent({ fileUrl: CDN_URL, storageKey: STORAGE_KEY }, content)).toBe(
      true,
    );
  });
});

describe('getUnreferencedFiles', () => {
  it('모든 파일이 참조된 경우 빈 배열을 반환한다', () => {
    const files = [
      makeFileItem({ fileId: 1, fileUrl: 'https://example.com/a.png' }),
      makeFileItem({ fileId: 2, fileUrl: 'https://example.com/b.png' }),
    ];
    const html = '<img src="https://example.com/a.png" /><img src="https://example.com/b.png" />';
    expect(getUnreferencedFiles(html, files)).toEqual([]);
  });

  it('참조되지 않은 파일만 반환한다', () => {
    const fileA = makeFileItem({ fileId: 1, fileUrl: 'https://example.com/a.png' });
    const fileB = makeFileItem({ fileId: 2, fileUrl: 'https://example.com/b.png' });
    const html = '<img src="https://example.com/a.png" />';
    expect(getUnreferencedFiles(html, [fileA, fileB])).toEqual([fileB]);
  });

  it('HTML이 비어 있으면 모든 파일을 반환한다', () => {
    const files = [makeFileItem({ fileUrl: 'https://example.com/a.png' })];
    expect(getUnreferencedFiles('', files)).toEqual(files);
  });

  it('파일 목록이 비어 있으면 빈 배열을 반환한다', () => {
    expect(getUnreferencedFiles('<img src="https://example.com/a.png" />', [])).toEqual([]);
  });
});
