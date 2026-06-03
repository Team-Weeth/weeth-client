import { IndentExtension } from './IndentExtension';
import { TableGapExtension } from './TableGapExtension';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Code from '@tiptap/extension-code';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import Strike from '@tiptap/extension-strike';
import Blockquote from '@tiptap/extension-blockquote';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import HardBreak from '@tiptap/extension-hard-break';
import History from '@tiptap/extension-history';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import { mergeAttributes } from '@tiptap/core';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { normalizeHref } from './normalizeHref';

const lowlight = createLowlight(common);

const NormalizedLink = Link.extend({
  renderHTML({ HTMLAttributes }) {
    const { href, ...rest } = HTMLAttributes;
    return [
      'a',
      mergeAttributes(this.options.HTMLAttributes, {
        ...rest,
        href: href ? normalizeHref(String(href)) : href,
      }),
      0,
    ];
  },
});

export const editorExtensions = [
  Document,
  Paragraph,
  Text,
  Heading.configure({ levels: [1, 2, 3] }),
  Bold,
  Italic,
  Code,
  // TODO: 코드 블록 언어 선택 UI 추가 (현재는 auto-detect만 지원)
  CodeBlockLowlight.configure({ lowlight }),
  Strike,
  Blockquote,
  BulletList.configure({ keepMarks: true, keepAttributes: false }),
  OrderedList.configure({ keepMarks: true, keepAttributes: false }),
  ListItem,
  HorizontalRule,
  HardBreak,
  History,
  Dropcursor,
  Gapcursor,
  Typography,
  Placeholder.configure({ placeholder: "'/' 키를 눌러서 명령어를 사용해 보세요." }),
  TaskList,
  TaskItem.configure({ nested: true, onReadOnlyChecked: () => false }),
  IndentExtension,
  NormalizedLink.configure({
    openOnClick: false,
    autolink: true,
    linkOnPaste: true,
    HTMLAttributes: {
      target: '_blank',
      rel: 'noopener noreferrer nofollow',
    },
  }),
  Table.extend({
    addKeyboardShortcuts() {
      return {
        'Alt-t': () =>
          this.editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      };
    },
  }).configure({
    resizable: true,
    handleWidth: 5,
    cellMinWidth: 100,
    lastColumnResizable: true,
  }),
  TableRow,
  TableCell,
  TableHeader,
  TableGapExtension,
];
