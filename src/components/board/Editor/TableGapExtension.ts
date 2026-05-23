import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const TABLE_GAP_KEY = new PluginKey('tableGap');

/**
 * 테이블 위/아래 paragraph 삽입 기능.
 * - 테이블 마지막 행에서 ArrowDown 시 아래에 paragraph 삽입/이동
 * - 테이블 위/아래 gap 영역 클릭 시 해당 위치에 paragraph 삽입
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

              decorations.push(
                Decoration.widget(pos, () => {
                  const div = document.createElement('div');
                  div.className = 'table-gap table-gap-before';
                  div.setAttribute('data-table-gap', 'before');
                  div.setAttribute('data-pos', String(pos));
                  return div;
                }),
              );

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

          handleKeyDown(view, event) {
            if (event.key !== 'ArrowDown') return false;

            const { state } = view;
            const { $head } = state.selection;

            // 현재 커서가 table 안에 있는지 확인
            let tableDepth = -1;
            for (let d = $head.depth; d > 0; d--) {
              if ($head.node(d).type.name === 'table') {
                tableDepth = d;
                break;
              }
            }
            if (tableDepth === -1) return false;

            // 마지막 행인지 확인
            const tableNode = $head.node(tableDepth);
            const rowIndex = $head.index(tableDepth);
            if (rowIndex !== tableNode.childCount - 1) return false;

            // 테이블 이후 위치에 paragraph 삽입 또는 이동
            const afterTablePos = $head.before(tableDepth) + tableNode.nodeSize;
            const nodeAfter = state.doc.nodeAt(afterTablePos);
            const { tr } = state;

            if (nodeAfter?.type.name === 'paragraph') {
              tr.setSelection(TextSelection.create(tr.doc, afterTablePos + 1));
            } else {
              const paragraph = state.schema.nodes.paragraph.create();
              tr.insert(afterTablePos, paragraph);
              tr.setSelection(TextSelection.create(tr.doc, afterTablePos + 1));
            }

            view.dispatch(tr);
            view.focus();
            event.preventDefault();
            return true;
          },

          handleDOMEvents: {
            mousedown(view, event) {
              if (!view.editable) return false;
              const target = event.target as HTMLElement;
              if (!target.classList.contains('table-gap')) return false;

              event.preventDefault();

              const pos = Number(target.getAttribute('data-pos'));
              if (isNaN(pos)) return false;

              const { state } = view;
              const paragraph = state.schema.nodes.paragraph.create();
              const tr = state.tr.insert(pos, paragraph);
              tr.setSelection(TextSelection.create(tr.doc, pos + 1));

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
