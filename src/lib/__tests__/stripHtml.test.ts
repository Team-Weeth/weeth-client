import { stripHtml } from '@/lib/stripHtml';

describe('stripHtml', () => {
  it('빈 문자열은 빈 문자열을 반환한다', () => {
    expect(stripHtml('')).toBe('');
  });

  it('태그 없는 텍스트는 그대로 반환한다', () => {
    expect(stripHtml('hello world')).toBe('hello world');
  });

  describe('<br> → \\n', () => {
    it.each([
      ['<br>', 'a<br>b', 'a\nb'],
      ['<br/>', 'a<br/>b', 'a\nb'],
      ['<BR />', 'a<BR />b', 'a\nb'],
    ])('%s을 \\n으로 변환한다', (_tag, input, expected) => {
      expect(stripHtml(input)).toBe(expected);
    });
  });

  describe('블록 닫힘 태그 → \\n', () => {
    it.each([
      ['p', '<p>text</p>', 'text'],
      ['h1', '<h1>제목</h1>', '제목'],
      ['h6', '<h6>소제목</h6>', '소제목'],
      ['li', '<li>항목</li>', '항목'],
      ['div', '<div>내용</div>', '내용'],
      ['blockquote', '<blockquote>인용</blockquote>', '인용'],
    ])('</%s>를 \\n으로 변환한다', (_tag, input, expected) => {
      expect(stripHtml(input)).toBe(expected);
    });
  });

  it('나머지 태그를 제거한다', () => {
    expect(stripHtml('<span class="foo">text</span>')).toBe('text');
    expect(stripHtml('<strong>bold</strong>')).toBe('bold');
  });

  it('3개 이상 연속 줄바꿈을 \\n\\n으로 축소한다', () => {
    expect(stripHtml('a<br><br><br>b')).toBe('a\n\nb');
  });

  it('앞뒤 공백을 제거한다', () => {
    expect(stripHtml('  <p>text</p>  ')).toBe('text');
  });

  it('복합 HTML을 plain text로 변환한다', () => {
    const html = '<h1>제목</h1><p>본문 <strong>강조</strong></p>';
    expect(stripHtml(html)).toBe('제목\n본문 강조');
  });
});
