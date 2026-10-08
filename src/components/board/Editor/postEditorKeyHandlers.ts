import type { MutableRefObject } from 'react';
import { TextSelection } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

const LIST_TYPES = ['bulletList', 'orderedList', 'taskList'];

/**
 * TipTap handleKeyDown 핸들러 팩토리.
 * showSlashMenuRef를 캡처해 stale closure 없이 최신 슬래시 메뉴 상태를 참조한다.
 */
export function createKeyDownHandler(
  showSlashMenuRef: MutableRefObject<boolean>,
): (view: EditorView, event: KeyboardEvent) => boolean {
  return (view, event) => {
    // 슬래시 메뉴 우선 처리 (ref로 stale closure 없이 최신 값 참조)
    if (showSlashMenuRef.current) {
      if (event.key === 'Enter' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        return true;
      }
    }

    const { state } = view;
    const { $from } = state.selection;

    // 백틱 인라인 코드 단축키
    if (event.key === '`') {
      const blockStart = $from.start();
      const textBefore = state.doc.textBetween(blockStart, $from.pos);
      const openIndex = textBefore.lastIndexOf('`');

      if (openIndex !== -1) {
        const innerText = textBefore.slice(openIndex + 1);

        if (innerText.length > 0) {
          event.preventDefault();
          const from = blockStart + openIndex;
          const to = $from.pos;
          const codeMark = state.schema.marks.code.create();
          const codeText = state.schema.text(innerText, [codeMark]);
          const tr = state.tr.replaceWith(from, to, codeText);
          tr.removeStoredMark(state.schema.marks.code);

          view.dispatch(tr);
          return true;
        }
      }
    }

    // Backspace UX 개선
    if (event.key === 'Backspace') {
      if ($from.parentOffset === 0 && $from.parent.textContent === '') {
        // 빈 헤딩 → 일반 단락으로 전환
        if ($from.parent.type.name === 'heading') {
          view.dispatch(
            state.tr.setBlockType($from.pos, $from.pos, state.schema.nodes.paragraph),
          );
          return true;
        }

        // 빈 paragraph가 리스트 바로 뒤에 있을 때 리스트 재진입 방지
        if ($from.depth < 1) return false;
        const resolvedPos = state.doc.resolve($from.before());
        const nodeBefore = resolvedPos.nodeBefore;

        if (
          $from.parent.type.name === 'paragraph' &&
          nodeBefore &&
          LIST_TYPES.includes(nodeBefore.type.name)
        ) {
          const paragraphStart = $from.before();
          const paragraphEnd = $from.after();
          const endOfPrevNode = paragraphStart - 1;
          const tr = state.tr.delete(paragraphStart, paragraphEnd);
          const mappedPos = tr.mapping.map(endOfPrevNode);
          tr.setSelection(TextSelection.near(tr.doc.resolve(mappedPos), -1));
          view.dispatch(tr);
          return true;
        }
      }
    }

    return false;
  };
}
