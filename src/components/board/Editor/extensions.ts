import { IndentExtension } from './IndentExtension';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
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

export const editorExtensions = [
  Document,
  Paragraph,
  Text,
  Heading.configure({ levels: [1, 2, 3] }),
  Bold,
  Italic,
  Code,
  CodeBlock,
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
  Placeholder.configure({ placeholder: "명령어는 '/'를 입력하세요." }),
  TaskList,
  TaskItem.configure({ nested: true, onReadOnlyChecked: () => false }),
  IndentExtension,
];
