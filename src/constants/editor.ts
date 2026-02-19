import { Editor as TiptapEditor } from '@tiptap/core';
import { MenuItem } from '@/types/editor';

export const STYLE_ITEMS: MenuItem[] = [
  {
    label: 'Text',
    description: '일반 텍스트',
    icon: 'T',
    command: (editor: TiptapEditor) => editor.chain().focus().clearNodes().setParagraph().run(),
  },
  {
    label: 'Heading 1',
    description: '큰 제목',
    icon: 'H1',
    command: (editor: TiptapEditor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    label: 'Heading 2',
    description: '중간 제목',
    icon: 'H2',
    command: (editor: TiptapEditor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: 'Heading 3',
    description: '작은 제목',
    icon: 'H3',
    command: (editor: TiptapEditor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: 'Bullet List',
    description: '순서 없는 목록',
    icon: '•',
    command: (editor: TiptapEditor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    label: 'Numbered List',
    description: '순서 있는 목록',
    icon: '1.',
    command: (editor: TiptapEditor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    label: 'To-do List',
    description: '체크리스트',
    icon: '☑',
    command: (editor: TiptapEditor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    label: 'Blockquote',
    description: '인용',
    icon: '"',
    command: (editor: TiptapEditor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    label: 'Code Block',
    description: '코드 블록',
    icon: '</>',
    command: (editor: TiptapEditor) => editor.chain().focus().toggleCodeBlock().run(),
  },
];

export const INSERT_ITEMS: MenuItem[] = [
  {
    label: 'Separator',
    description: '구분선',
    icon: '—',
    command: (editor: TiptapEditor) => editor.chain().focus().setHorizontalRule().run(),
  },
];
