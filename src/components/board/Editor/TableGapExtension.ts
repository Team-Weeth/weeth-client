import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const TABLE_GAP_KEY = new PluginKey('tableGap');

/**
 * 테이블 위/아래에 클릭 가능한 gap 영역을 추가하는 확장.
 * 호버 시 "+" 라인이 나타나고, 클릭하면 해당 위치에 빈 paragraph를 삽입한다.
 */
export const TableGapExtension = Extension.create({
  name: 'tableGap',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: TABLE_GAP_KEY,
        props: {
          decorations(state) {
            const decorations: Decoration[] = [];
            const { doc } = state;

            doc.forEach((node, pos) => {
              if (node.type.name !== 'table') return;

              // 테이블 위쪽 gap
              decorations.push(
                Decoration.widget(pos, () => {
                  const div = document.createElement('div');
                  div.className = 'table-gap table-gap-before';
                  div.setAttribute('data-table-gap', 'before');
                  div.setAttribute('data-pos', String(pos));
                  return div;
                }),
              );

              // 테이블 아래쪽 gap
              const afterPos = pos + node.nodeSize;
              decorations.push(
                Decoration.widget(afterPos, () => {
                  const div = document.createElement('div');
                  div.className = 'table-gap table-gap-after';
                  div.setAttribute('data-table-gap', 'after');
                  div.setAttribute('data-pos', String(afterPos));
                  return div;
                }),
              );
            });

            return DecorationSet.create(doc, decorations);
          },

          handleDOMEvents: {
            click(view, event) {
              const target = event.target as HTMLElement;
              if (!target.classList.contains('table-gap')) return false;

              const pos = Number(target.getAttribute('data-pos'));
              if (isNaN(pos)) return false;

              const { state } = view;
              const paragraph = state.schema.nodes.paragraph.create();
              const tr = state.tr.insert(pos, paragraph);

              // 삽입된 paragraph 내부에 커서 배치
              const cursorPos = tr.mapping.map(pos) + 1;
              tr.setSelection(TextSelection.create(tr.doc, cursorPos));

              view.dispatch(tr);
              view.focus();
              return true;
            },
          },
        },
      }),
    ];
  },
});
