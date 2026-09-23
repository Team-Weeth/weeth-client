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

  describe('테이블 처리', () => {
    it('<td> 간 구분자를 생성한다', () => {
      expect(stripHtml('<table><tr><td>A</td><td>B</td></tr></table>')).toBe('A\nB');
    });

    it('<th> 간 구분자를 생성한다', () => {
      expect(stripHtml('<table><tr><th>헤더1</th><th>헤더2</th></tr></table>')).toBe(
        '헤더1\n헤더2',
      );
    });

    it('Tiptap 테이블 형식을 plain text로 변환한다', () => {
      const html =
        '<table><tbody>' +
        '<tr><th colspan="1" rowspan="1"><p>헤더 1</p></th><th colspan="1" rowspan="1"><p>헤더 2</p></th></tr>' +
        '<tr><td colspan="1" rowspan="1"><p>데이터 1</p></td><td colspan="1" rowspan="1"><p>데이터 2</p></td></tr>' +
        '</tbody></table>';
      expect(stripHtml(html)).toBe('헤더 1\n\n헤더 2\n\n데이터 1\n\n데이터 2');
    });
  });

  describe('<script> / <style> 내용 처리', () => {
    it('<script> 태그 내부 텍스트는 plain text로 노출된다', () => {
      expect(stripHtml('<p>공지</p><script>alert(1)</script>')).toBe('공지\nalert(1)');
    });

    it('<style> 태그 내부 텍스트는 plain text로 노출된다', () => {
      expect(stripHtml('<style>.foo{color:red}</style><p>공지</p>')).toBe('.foo{color:red}공지');
    });
  });

  describe('마크다운 구문 처리', () => {
    it.each([
      ['bold', '**굵게**', '**굵게**'],
      ['heading', '# 제목', '# 제목'],
      ['link', '[링크](https://example.com)', '[링크](https://example.com)'],
    ])('%s 구문은 plain text로 통과한다', (_name, input, expected) => {
      expect(stripHtml(input)).toBe(expected);
    });
  });

  describe('HTML 엔티티 디코딩', () => {
    it.each([
      ['&amp;', '&amp;', '&'],
      ['&lt;', '&lt;', '<'],
      ['&gt;', '&gt;', '>'],
      ['&nbsp;', 'a&nbsp;b', 'a b'],
      ['&quot;', '&quot;', '"'],
      ['&apos;', '&apos;', "'"],
      ['&#39;', '&#39;', "'"],
    ])('%s를 디코딩한다', (_entity, input, expected) => {
      expect(stripHtml(input)).toBe(expected);
    });

    it('숫자형 엔티티(&#NNN;)를 디코딩한다', () => {
      expect(stripHtml('&#65;')).toBe('A');
      expect(stripHtml('&#8212;')).toBe('—');
    });

    it('16진수 엔티티(&#xHH;)를 디코딩한다', () => {
      expect(stripHtml('&#x41;')).toBe('A');
      expect(stripHtml('&#x2014;')).toBe('—');
    });

    it('이중 인코딩된 &amp;lt;는 &lt;로 디코딩한다', () => {
      expect(stripHtml('&amp;lt;')).toBe('&lt;');
    });

    it('태그 제거 후 엔티티를 디코딩한다', () => {
      expect(stripHtml('<p>a &amp; b</p>')).toBe('a & b');
    });
  });
});
