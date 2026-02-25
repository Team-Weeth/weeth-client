import { Extension } from '@tiptap/core';

// Tab 들여쓰기 한 단계당 증가 크기 (rem)
const INDENT_STEP_REM = 2;
const MAX_INDENT_LEVEL = 4;

/**
 * paragraph / heading 블록의 Tab 들여쓰기를 지원하는 Extension
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
        types: ['paragraph', 'heading'],
        attributes: {
          indent: {
            default: 0,
            parseHTML: (el) => parseInt(el.dataset.indent ?? '0', 10),
            // 렌더링 시 단계에 비례한 margin-left 적용
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
    // 커서가 listItem 노드 안에 있는지 여부 탐색
    const isInsideList = () => {
      const { $from } = this.editor.state.selection;
      for (let depth = $from.depth; depth > 0; depth--) {
        if ($from.node(depth).type.name === 'listItem') return true;
      }
      return false;
    };

    return {
      Tab: () => {
        if (isInsideList()) return false;

        const { $from } = this.editor.state.selection;
        const next = Math.min(($from.parent.attrs.indent ?? 0) + 1, MAX_INDENT_LEVEL);
        return this.editor.commands.updateAttributes($from.parent.type.name, { indent: next });
      },

      'Shift-Tab': () => {
        if (isInsideList()) return false;

        const { $from } = this.editor.state.selection;
        const next = Math.max(($from.parent.attrs.indent ?? 0) - 1, 0);
        return this.editor.commands.updateAttributes($from.parent.type.name, { indent: next });
      },

      Backspace: () => {
        if (isInsideList()) return false;

        const { $from } = this.editor.state.selection;
        // 커서가 블록 시작점이 아니면 일반 backspace 처리
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
