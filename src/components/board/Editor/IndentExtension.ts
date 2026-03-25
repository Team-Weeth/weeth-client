import { Extension } from '@tiptap/core';

// Tab 들여쓰기 한 단계당 증가 크기 (rem)
const INDENT_STEP_REM = 2;
const MAX_INDENT_LEVEL = 4;

const LIST_TYPES = ['bulletList', 'orderedList', 'taskList'];
const LIST_ITEM_TYPES = ['listItem', 'taskItem'];

/**
 * paragraph / heading / list 블록의 Tab 들여쓰기를 지원하는 Extension
 *
 * - Tab (들여쓰기)
 * - Shift-Tab (들여쓰기 한 단계 감소)
 * - Backspace (커서가 블록 시작점에 있을 때 들여쓰기 한 단계 감소)
 */

export const IndentExtension = Extension.create({
  name: 'indent',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', ...LIST_TYPES],
        attributes: {
          indent: {
            default: 0,
            parseHTML: (el) => parseInt(el.dataset.indent ?? '0', 10),
            renderHTML: ({ indent }) => {
              if (!indent) return {};
              return {
                'data-indent': indent,
                style: `margin-left: ${indent * INDENT_STEP_REM}rem`,
              };
            },
          },
        },
      },
    ];
  },

  addKeyboardShortcuts() {
    // 커서가 위치한 가장 가까운 listItem의 depth 정보를 반환
    const getListContext = () => {
      const { $from } = this.editor.state.selection;
      for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth);
        if (LIST_ITEM_TYPES.includes(node.type.name)) {
          const listNode = $from.node(depth - 1);
          const indexInList = $from.index(depth - 1);
          return { listNode, listDepth: depth - 1, indexInList };
        }
      }
      return null;
    };

    const updateListIndent = (delta: number) => {
      const ctx = getListContext();
      if (!ctx) return false;

      const { listNode, listDepth } = ctx;
      const currentIndent = listNode.attrs.indent ?? 0;
      const next = Math.min(Math.max(currentIndent + delta, 0), MAX_INDENT_LEVEL);
      if (next === currentIndent) return true;

      const { $from } = this.editor.state.selection;
      // $from.start(listDepth)는 리스트 노드 내부 시작 위치, -1로 노드 자체 위치
      const listPos = $from.start(listDepth) - 1;
      const { tr } = this.editor.state;
      tr.setNodeMarkup(listPos, undefined, { ...listNode.attrs, indent: next });
      this.editor.view.dispatch(tr);
      return true;
    };

    return {
      Tab: () => {
        const ctx = getListContext();
        if (ctx) {
          // 첫 번째 아이템이 아니면 리스트 구조 들여쓰기 시도
          const itemType = ctx.listNode.type.name === 'taskList' ? 'taskItem' : 'listItem';
          if (ctx.indexInList > 0 && this.editor.commands.sinkListItem(itemType)) {
            return true;
          }
          // 첫 번째 아이템이거나 sink 실패 → 리스트 블록 자체 indent
          return updateListIndent(1);
        }

        const { $from } = this.editor.state.selection;
        const next = Math.min(($from.parent.attrs.indent ?? 0) + 1, MAX_INDENT_LEVEL);
        return this.editor.commands.updateAttributes($from.parent.type.name, { indent: next });
      },

      'Shift-Tab': () => {
        const ctx = getListContext();
        if (ctx) {
          const itemType = ctx.listNode.type.name === 'taskList' ? 'taskItem' : 'listItem';
          if (this.editor.commands.liftListItem(itemType)) return true;
          return updateListIndent(-1);
        }

        const { $from } = this.editor.state.selection;
        const next = Math.max(($from.parent.attrs.indent ?? 0) - 1, 0);
        return this.editor.commands.updateAttributes($from.parent.type.name, { indent: next });
      },

      Backspace: () => {
        const ctx = getListContext();
        if (ctx) {
          const { $from } = this.editor.state.selection;
          // 커서가 아이템 시작점에 있을 때만 리스트 이탈 시도
          if ($from.parentOffset !== 0) return false;
          const itemType = ctx.listNode.type.name === 'taskList' ? 'taskItem' : 'listItem';
          return this.editor.commands.liftListItem(itemType);
        }

        const { $from } = this.editor.state.selection;
        if ($from.parentOffset !== 0) return false;

        const currentIndent = $from.parent.attrs.indent ?? 0;
        if (currentIndent === 0) return false;

        return this.editor.commands.updateAttributes($from.parent.type.name, {
          indent: currentIndent - 1,
        });
      },
    };
  },
});
