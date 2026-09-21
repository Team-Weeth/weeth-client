// lowlight는 ESM 전용이라 jest transform 대상이 아니다.
// 문법 하이라이팅은 데코레이션 단계라 HTML 파싱/직렬화 검증에 영향을 주지 않으므로 대체한다.
jest.mock('lowlight', () => ({
  common: {},
  createLowlight: () => ({
    registered: () => false,
    listLanguages: () => [],
    highlight: () => ({ type: 'root', children: [] }),
    highlightAuto: () => ({ type: 'root', children: [] }),
  }),
}));

import { Editor } from '@tiptap/core';
import { editorExtensions } from '@/components/board/Editor/extensions';

/**
 * 백엔드가 v3 마크다운 본문을 변환해 내려주는 HTML이
 * 실제 에디터 확장 구성에서 손실 없이 파싱되는지 검증한다.
 *
 * 각 입력은 서버의 MarkdownToTiptapHtmlConverter가 실제로 출력하는 HTML이다.
 * 이 테스트가 깨지면 서버 변환 규칙과 에디터 확장 구성이 어긋난 것이다.
 */
const roundTrip = (html: string) => {
  const editor = new Editor({ content: html, extensions: editorExtensions });
  const parsed = editor.getHTML();
  editor.destroy();
  return parsed;
};

// 블록 사이 개행은 직렬화 과정에서 사라지므로 비교 전에 걷어낸다
const withoutLineBreaks = (html: string) => html.replace(/\n(?![^<]*<\/code>)/g, '');

describe('백엔드 마크다운 변환 결과의 Tiptap 파싱', () => {
  describe('구조가 그대로 보존되는 서식', () => {
    it.each([
      ['제목', '<h1>제목1</h1>\n<h2>제목2</h2>\n<h3>제목3</h3>'],
      ['h4 강등 결과', '<p><strong>제목4</strong></p>'],
      [
        '인라인 서식',
        '<p><strong>굵게</strong> <em>기울임</em> <s>취소선</s> <code>코드</code></p>',
      ],
      ['불릿 리스트', '<ul>\n<li><p>항목 1</p></li>\n<li><p>항목 2</p></li>\n</ul>'],
      [
        '중첩 리스트',
        '<ul>\n<li><p>항목</p><ul>\n<li><p>중첩</p></li>\n</ul></li>\n</ul>',
      ],
      ['번호 리스트', '<ol>\n<li><p>첫째</p></li>\n<li><p>둘째</p></li>\n</ol>'],
      ['인용', '<blockquote><p>인용문<br>둘째 줄</p></blockquote>'],
      ['구분선', '<p>위</p>\n<hr>\n<p>아래</p>'],
      ['문단 내 줄바꿈', '<p>첫째 줄<br>둘째 줄</p>'],
      ['빈 문단 간격', '<p>위</p>\n<p></p>\n<p></p>\n<p>아래</p>'],
    ])('%s', (_name, html) => {
      expect(roundTrip(html)).toBe(withoutLineBreaks(html));
    });

    it('코드 블록은 언어 클래스와 내부 줄바꿈을 유지한다', () => {
      const html = '<pre><code class="language-kotlin">val a = 1\n\nval b = 2\n</code></pre>';

      expect(roundTrip(html)).toBe(html);
    });
  });

  describe('에디터가 자체 구조를 덧붙이는 서식', () => {
    it('체크리스트를 taskItem으로 인식하고 체크 상태를 보존한다', () => {
      const html =
        '<ul data-type="taskList">\n' +
        '<li data-type="taskItem" data-checked="false"><p>미완료 항목</p></li>\n' +
        '<li data-type="taskItem" data-checked="true"><p>완료 항목</p></li>\n</ul>';

      const parsed = roundTrip(html);

      expect(parsed).toContain('data-type="taskList"');
      expect(parsed).toContain('data-checked="false"');
      expect(parsed).toContain('data-checked="true"');
      expect(parsed).toContain('<p>미완료 항목</p>');
      expect(parsed).toContain('<p>완료 항목</p>');
      // 체크 상태가 체크박스 입력에도 반영된다
      expect(parsed).toContain('<input type="checkbox" checked="checked">');
    });

    it('테이블의 셀 구조와 colspan/rowspan을 보존한다', () => {
      const html =
        '<table><tbody><tr>\n' +
        '<th colspan="1" rowspan="1"><p>헤더 1</p></th>\n' +
        '<th colspan="1" rowspan="1"><p>헤더 2</p></th>\n</tr>\n<tr>\n' +
        '<td colspan="1" rowspan="1"><p>데이터 1</p></td>\n' +
        '<td colspan="1" rowspan="1"><p>데이터 2</p></td>\n</tr>\n</tbody></table>';

      const parsed = roundTrip(html);

      expect(parsed).toContain('<th colspan="1" rowspan="1"><p>헤더 1</p></th>');
      expect(parsed).toContain('<td colspan="1" rowspan="1"><p>데이터 2</p></td>');
      expect(parsed).not.toContain('<thead>');
    });

    it('링크의 target/rel은 서버가 아닌 Link 확장이 부여한다', () => {
      const html = '<p><a href="https://weeth.com">링크</a></p>';

      expect(roundTrip(html)).toBe(
        '<p><a target="_blank" rel="noopener noreferrer nofollow" href="https://weeth.com">링크</a></p>',
      );
    });
  });
});
