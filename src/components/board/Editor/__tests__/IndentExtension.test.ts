import { Editor } from '@tiptap/core';
import BulletList from '@tiptap/extension-bullet-list';
import Document from '@tiptap/extension-document';
import ListItem from '@tiptap/extension-list-item';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { IndentExtension } from '../IndentExtension';

function createEditor(content = '<p>Hello</p>'): Editor {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return new Editor({
    element: el,
    extensions: [Document, Paragraph, Text, IndentExtension],
    content,
  });
}

function createListEditor(content: string): Editor {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return new Editor({
    element: el,
    extensions: [Document, Paragraph, Text, BulletList, ListItem, IndentExtension],
    content,
  });
}

describe('IndentExtension', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = createEditor();
  });

  afterEach(() => {
    editor.destroy();
    document.body.innerHTML = '';
  });

  // ──────────────────────────────────────────────
  // parseHTML
  // ──────────────────────────────────────────────
  describe('parseHTML — data-indent 파싱', () => {
    it('data-indent="3"이 있으면 attrs.indent=3을 반환한다', () => {
      editor.commands.setContent('<p data-indent="3">Hello</p>');
      expect(editor.state.doc.firstChild?.attrs.indent).toBe(3);
    });

    it('data-indent 없으면 기본값 0을 반환한다', () => {
      expect(editor.state.doc.firstChild?.attrs.indent).toBe(0);
    });
  });

  // ──────────────────────────────────────────────
  // renderHTML
  // ──────────────────────────────────────────────
  describe('renderHTML — HTML 직렬화', () => {
    it('indent=0이면 data-indent와 margin-left style을 추가하지 않는다', () => {
      const html = editor.getHTML();
      expect(html).not.toContain('data-indent');
      expect(html).not.toContain('margin-left');
    });

    it('indent=1이면 data-indent="1"과 margin-left: 2rem을 추가한다', () => {
      editor.commands.setContent('<p data-indent="1">Hello</p>');
      const html = editor.getHTML();
      expect(html).toContain('data-indent="1"');
      expect(html).toContain('margin-left: 2rem');
    });

    it('indent=4이면 margin-left: 8rem (4 × 2rem)을 추가한다', () => {
      editor.commands.setContent('<p data-indent="4">Hello</p>');
      const html = editor.getHTML();
      expect(html).toContain('margin-left: 8rem');
    });
  });

  // ──────────────────────────────────────────────
  // Tab (비리스트)
  // ──────────────────────────────────────────────
  describe('Tab (비리스트 컨텍스트)', () => {
    it('indent 0 → 1로 증가한다', () => {
      editor.commands.setTextSelection(1);
      editor.commands.keyboardShortcut('Tab');
      expect(editor.state.doc.firstChild?.attrs.indent).toBe(1);
    });

    it('indent 3 → 4 (최대)가 된다', () => {
      editor.commands.setContent('<p data-indent="3">Hello</p>');
      editor.commands.setTextSelection(1);
      editor.commands.keyboardShortcut('Tab');
      expect(editor.state.doc.firstChild?.attrs.indent).toBe(4);
    });

    it('indent 4 (최대)에서 더 이상 증가하지 않는다', () => {
      editor.commands.setContent('<p data-indent="4">Hello</p>');
      editor.commands.setTextSelection(1);
      editor.commands.keyboardShortcut('Tab');
      expect(editor.state.doc.firstChild?.attrs.indent).toBe(4);
    });
  });

  // ──────────────────────────────────────────────
  // Shift-Tab (비리스트)
  // ──────────────────────────────────────────────
  describe('Shift-Tab (비리스트 컨텍스트)', () => {
    it('indent 2 → 1로 감소한다', () => {
      editor.commands.setContent('<p data-indent="2">Hello</p>');
      editor.commands.setTextSelection(1);
      editor.commands.keyboardShortcut('Shift-Tab');
      expect(editor.state.doc.firstChild?.attrs.indent).toBe(1);
    });

    it('indent 0에서 더 이상 감소하지 않는다 (최솟값 0 유지)', () => {
      editor.commands.setTextSelection(1);
      editor.commands.keyboardShortcut('Shift-Tab');
      expect(editor.state.doc.firstChild?.attrs.indent).toBe(0);
    });
  });

  // ──────────────────────────────────────────────
  // Backspace (비리스트)
  // ──────────────────────────────────────────────
  describe('Backspace (비리스트 컨텍스트)', () => {
    it('커서가 블록 시작(offset=0)이고 indent=1이면 indent를 0으로 감소시킨다', () => {
      editor.commands.setContent('<p data-indent="1">Hello</p>');
      editor.commands.setTextSelection(1);
      editor.commands.keyboardShortcut('Backspace');
      expect(editor.state.doc.firstChild?.attrs.indent).toBe(0);
    });

    it('커서가 블록 시작이고 indent=0이면 Extension이 처리하지 않는다', () => {
      // indent=0 → Extension returns false → default Backspace 동작
      editor.commands.setTextSelection(1);
      editor.commands.keyboardShortcut('Backspace');
      expect(editor.state.doc.firstChild?.attrs.indent).toBe(0);
    });

    it('커서가 블록 중간(offset>0)이면 Extension이 처리하지 않아 indent가 변경되지 않는다', () => {
      editor.commands.setContent('<p data-indent="2">Hello</p>');
      // position 2 = 'H' 이후 (parentOffset=1)
      editor.commands.setTextSelection(2);
      editor.commands.keyboardShortcut('Backspace');
      expect(editor.state.doc.firstChild?.attrs.indent).toBe(2);
    });
  });

  // ──────────────────────────────────────────────
  // 리스트 컨텍스트 (BulletList + ListItem)
  // ──────────────────────────────────────────────
  // 토큰 위치 계산 (<ul><li><p>First</p></li><li><p>Second</p></li></ul>):
  //   pos 3  = first listItem paragraph content start  (indexInList=0)
  //   pos 12 = second listItem paragraph content start (indexInList=1)
  describe('리스트 컨텍스트', () => {
    let listEditor: Editor;

    beforeEach(() => {
      listEditor = createListEditor('<ul><li><p>First</p></li><li><p>Second</p></li></ul>');
    });

    afterEach(() => {
      listEditor.destroy();
    });

    it('Tab — 첫 번째 아이템(indexInList=0): 리스트 블록 indent가 증가한다', () => {
      listEditor.commands.setTextSelection(3); // inside first listItem
      listEditor.commands.keyboardShortcut('Tab');
      // IndentExtension.updateListIndent(1) → bulletList.attrs.indent = 1
      expect(listEditor.state.doc.firstChild?.attrs.indent).toBe(1);
    });

    it('Tab — 두 번째 아이템(indexInList=1): sinkListItem으로 중첩 구조가 된다', () => {
      listEditor.commands.setTextSelection(12); // inside second listItem
      listEditor.commands.keyboardShortcut('Tab');
      // sinkListItem 성공 → root bulletList에 1개 아이템만 남음
      expect(listEditor.state.doc.firstChild?.childCount).toBe(1);
    });

    it('Shift-Tab — 리스트 아이템: liftListItem으로 리스트 밖으로 이탈한다', () => {
      listEditor.commands.setTextSelection(3);
      listEditor.commands.keyboardShortcut('Shift-Tab');
      // liftListItem 성공 → 첫 번째 아이템이 paragraph로 변환됨
      // doc의 첫 번째 노드가 더 이상 bulletList가 아님 (paragraph가 됨)
      expect(listEditor.state.doc.firstChild?.type.name).toBe('paragraph');
    });

    it('Backspace — 커서가 리스트 아이템 시작(offset=0): liftListItem으로 이탈한다', () => {
      listEditor.commands.setTextSelection(3);
      listEditor.commands.keyboardShortcut('Backspace');
      // liftListItem → 첫 번째 아이템이 paragraph로 변환됨
      expect(listEditor.state.doc.firstChild?.type.name).toBe('paragraph');
    });

    it('Backspace — 커서가 리스트 아이템 중간(offset>0): Extension이 처리하지 않는다', () => {
      listEditor.commands.setTextSelection(5); // inside "First", offset=2
      listEditor.commands.keyboardShortcut('Backspace');
      // Extension returns false → document structure unchanged (still bulletList)
      expect(listEditor.state.doc.firstChild?.type.name).toBe('bulletList');
    });
  });
});
