import { isReferencedInContent } from '@/lib/board/getUnreferencedFiles';

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
