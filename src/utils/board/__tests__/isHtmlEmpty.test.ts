import { isHtmlEmpty } from '@/utils/board/isHtmlEmpty';

describe('isHtmlEmpty', () => {
  it('빈 문자열은 true를 반환한다', () => {
    expect(isHtmlEmpty('')).toBe(true);
  });

  it('<p></p> 같은 빈 태그는 true를 반환한다', () => {
    expect(isHtmlEmpty('<p></p>')).toBe(true);
  });

  it('태그 안에 공백만 있으면 true를 반환한다', () => {
    expect(isHtmlEmpty('<p>   </p>')).toBe(true);
  });

  it('중첩된 빈 태그는 true를 반환한다', () => {
    expect(isHtmlEmpty('<div><p></p></div>')).toBe(true);
  });

  it('텍스트가 있는 HTML은 false를 반환한다', () => {
    expect(isHtmlEmpty('<p>내용</p>')).toBe(false);
  });

  it('중첩 태그 안에 텍스트가 있으면 false를 반환한다', () => {
    expect(isHtmlEmpty('<p><strong>볼드</strong></p>')).toBe(false);
  });

  it('태그 없는 일반 텍스트는 false를 반환한다', () => {
    expect(isHtmlEmpty('hello')).toBe(false);
  });

  it('Tiptap 빈 에디터 출력(<p><br class="ProseMirror-trailingBreak"></p>)은 true를 반환한다', () => {
    expect(isHtmlEmpty('<p><br class="ProseMirror-trailingBreak"></p>')).toBe(true);
  });
});
