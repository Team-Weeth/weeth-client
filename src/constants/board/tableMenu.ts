import { Editor as TiptapEditor } from '@tiptap/core';
import { CellSelection } from '@tiptap/pm/tables';
import { Node as PmNode } from '@tiptap/pm/model';
import {
  ArrowUpFromLine,
  ArrowDownFromLine,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  Trash2,
  Eraser,
  Minus,
  TableCellsMerge,
  TableCellsSplit,
  Crown,
  LucideIcon,
} from 'lucide-react';

export interface TableMenuItem {
  label: string;
  icon: LucideIcon;
  command: (editor: TiptapEditor) => void;
  destructive?: boolean;
}

export interface TableMenuGroup {
  title: string;
  items: TableMenuItem[];
}

/**
 * 선택된 셀의 행/열 인덱스를 기반으로 제목 행/열을 토글한다.
 * 행 선택 시 제목 행, 열 선택 시 제목 열로 자동 판별한다.
 * tableCell ↔ tableHeader 노드 타입을 변환하고 bold도 함께 적용/제거한다.
 */
function toggleHeaderAuto(editor: TiptapEditor) {
  const { state } = editor;
  const sel = state.selection;

  if (!(sel instanceof CellSelection)) return;

  // 행 선택이면 'row', 열 선택이면 'column', 둘 다 아니면 'row' 기본
  const mode: 'row' | 'column' = sel.isColSelection() ? 'column' : 'row';

  const tableNode = findTableNode(state);
  if (!tableNode) return;

  const { node: table, pos: tablePos } = tableNode;
  const targetIndices = new Set<number>();

  sel.forEachCell((_node, pos) => {
    const cellOffset = pos - tablePos - 1;
    const { row, col } = getCellRowCol(table, cellOffset);
    targetIndices.add(mode === 'row' ? row : col);
  });

  const allHeader = checkAllHeader(table, targetIndices, mode);

  const { tr } = state;
  const schema = state.schema;
  const headerType = schema.nodes.tableHeader;
  const cellType = schema.nodes.tableCell;

  if (!headerType || !cellType) return;

  table.forEach((row, rowOffset, rowIndex) => {
    row.forEach((cell, cellOffset, colIndex) => {
      const shouldToggle =
        mode === 'row' ? targetIndices.has(rowIndex) : targetIndices.has(colIndex);

      if (!shouldToggle) return;

      const targetType = allHeader ? cellType : headerType;
      if (cell.type === targetType) return;

      const cellStart = tablePos + 1 + rowOffset + 1 + cellOffset;
      const mapped = tr.mapping.map(cellStart);

      const boldMark = schema.marks.bold;
      if (boldMark) {
        const cellContentStart = mapped + 1;
        const cellContentEnd = mapped + cell.nodeSize - 1;
        if (allHeader) {
          tr.removeMark(cellContentStart, cellContentEnd, boldMark);
        } else {
          tr.addMark(cellContentStart, cellContentEnd, boldMark.create());
        }
      }

      tr.setNodeMarkup(mapped, targetType, cell.attrs);
    });
  });

  editor.view.dispatch(tr);
}

function findTableNode(state: {
  selection: {
    $from: {
      depth: number;
      node: (d: number) => PmNode;
      before: (d: number) => number;
    };
  };
}) {
  const { $from } = state.selection;
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.type.name === 'table') {
      return { node, pos: $from.before(d) };
    }
  }
  return null;
}

function getCellRowCol(table: PmNode, cellOffset: number): { row: number; col: number } {
  let offset = 0;
  for (let r = 0; r < table.childCount; r++) {
    const row = table.child(r);
    const rowStart = offset + 1;
    if (cellOffset >= rowStart && cellOffset < rowStart + row.content.size) {
      let co = 0;
      for (let c = 0; c < row.childCount; c++) {
        if (co === cellOffset - rowStart) {
          return { row: r, col: c };
        }
        co += row.child(c).nodeSize;
      }
      return { row: r, col: 0 };
    }
    offset += row.nodeSize;
  }
  return { row: 0, col: 0 };
}

function checkAllHeader(table: PmNode, indices: Set<number>, mode: 'row' | 'column'): boolean {
  let allHeader = true;
  table.forEach((row, _offset, rowIndex) => {
    row.forEach((cell, _cellOffset, colIndex) => {
      const target = mode === 'row' ? indices.has(rowIndex) : indices.has(colIndex);
      if (target && cell.type.name !== 'tableHeader') {
        allHeader = false;
      }
    });
  });
  return allHeader;
}

/**
 * 행 선택 시 행 삭제, 열 선택 시 열 삭제를 자동 판별하여 실행한다.
 */
function deleteSelectionAuto(editor: TiptapEditor) {
  const sel = editor.state.selection;
  if (!(sel instanceof CellSelection)) return;

  if (sel.isColSelection()) {
    editor.chain().focus().deleteColumn().run();
  } else {
    editor.chain().focus().deleteRow().run();
  }
}

/**
 * 선택된 셀들의 내용만 삭제한다 (셀 구조는 유지).
 */
function clearCellContent(editor: TiptapEditor) {
  const { state } = editor;
  const sel = state.selection;

  if (!(sel instanceof CellSelection)) return;

  const { tr } = state;

  sel.forEachCell((_node, pos) => {
    const mappedPos = tr.mapping.map(pos);
    const cell = tr.doc.nodeAt(mappedPos);
    if (!cell) return;

    const from = mappedPos + 1;
    const to = mappedPos + cell.nodeSize - 1;
    tr.replaceWith(from, to, state.schema.nodes.paragraph.create());
  });

  editor.view.dispatch(tr);
}

export const TABLE_MENU_GROUPS: TableMenuGroup[] = [
  {
    title: '삽입',
    items: [
      {
        label: '위에 행 삽입',
        icon: ArrowUpFromLine,
        command: (editor) => editor.chain().focus().addRowBefore().run(),
      },
      {
        label: '아래에 행 삽입',
        icon: ArrowDownFromLine,
        command: (editor) => editor.chain().focus().addRowAfter().run(),
      },
      {
        label: '왼쪽에 열 삽입',
        icon: ArrowLeftFromLine,
        command: (editor) => editor.chain().focus().addColumnBefore().run(),
      },
      {
        label: '오른쪽에 열 삽입',
        icon: ArrowRightFromLine,
        command: (editor) => editor.chain().focus().addColumnAfter().run(),
      },
    ],
  },
  {
    title: '서식',
    items: [
      {
        label: '제목 토글',
        icon: Crown,
        command: (editor) => toggleHeaderAuto(editor),
      },
      {
        label: '셀 병합',
        icon: TableCellsMerge,
        command: (editor) => editor.chain().focus().mergeCells().run(),
      },
      {
        label: '셀 분할',
        icon: TableCellsSplit,
        command: (editor) => editor.chain().focus().splitCell().run(),
      },
    ],
  },
  {
    title: '삭제',
    items: [
      {
        label: '내용 삭제',
        icon: Eraser,
        command: (editor) => clearCellContent(editor),
      },
      {
        label: '행/열 삭제',
        icon: Minus,
        command: (editor) => deleteSelectionAuto(editor),
        destructive: true,
      },
      {
        label: '표 삭제',
        icon: Trash2,
        command: (editor) => editor.chain().focus().deleteTable().run(),
        destructive: true,
      },
    ],
  },
];
