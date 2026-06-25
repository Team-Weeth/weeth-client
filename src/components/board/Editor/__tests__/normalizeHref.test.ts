import { normalizeHref } from '../normalizeHref';

describe('normalizeHref', () => {
  describe('허용된 스킴은 그대로 반환한다', () => {
    it.each([
      ['https://example.com'],
      ['https://example.com/path?q=1#anchor'],
      ['http://example.com'],
      ['mailto:user@example.com'],
      ['tel:010-1234-5678'],
    ])('%s', (href) => {
      expect(normalizeHref(href)).toBe(href);
    });
  });

  describe('허용되지 않은 스킴은 빈 문자열을 반환한다 (XSS 방어)', () => {
    it.each([
      ['javascript:alert(1)'],
      ["javascript:void(document.cookie='x='+document.cookie)"],
      ['data:text/html,<script>alert(1)</script>'],
      ['data:image/svg+xml,<svg onload="alert(1)"/>'],
      ['vbscript:MsgBox(1)'],
      ['ftp://files.example.com'],
    ])('%s', (href) => {
      expect(normalizeHref(href)).toBe('');
    });
  });

  it('프로토콜이 없는 도메인에는 https://를 붙인다', () => {
    expect(normalizeHref('example.com')).toBe('https://example.com');
  });

  it('서브패스가 있는 프로토콜 없는 URL에도 https://를 붙인다', () => {
    expect(normalizeHref('example.com/path/to/page')).toBe('https://example.com/path/to/page');
  });

  it('// 로 시작하는 프로토콜-상대 URL은 그대로 반환한다', () => {
    expect(normalizeHref('//cdn.example.com/a.js')).toBe('//cdn.example.com/a.js');
  });

  it('# 앵커는 그대로 반환한다', () => {
    expect(normalizeHref('#section-1')).toBe('#section-1');
  });

  it('빈 문자열은 그대로 반환한다', () => {
    expect(normalizeHref('')).toBe('');
  });
});
