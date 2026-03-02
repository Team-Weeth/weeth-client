import { Editor as TiptapEditor } from '@tiptap/core';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code2,
  Minus,
} from 'lucide-react';
import { MenuItem } from '@/types/editor';

export const STYLE_ITEMS: MenuItem[] = [
  {
    label: 'Text',
    description: '일반 텍스트',
    icon: Type,
    command: (editor: TiptapEditor) => editor.chain().focus().clearNodes().setParagraph().run(),
  },
  {
    label: 'Heading 1',
    description: '큰 제목',
    icon: Heading1,
    command: (editor: TiptapEditor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    label: 'Heading 2',
    description: '중간 제목',
    icon: Heading2,
    command: (editor: TiptapEditor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: 'Heading 3',
    description: '작은 제목',
    icon: Heading3,
    command: (editor: TiptapEditor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: 'Bullet List',
    description: '순서 없는 목록',
    icon: List,
    command: (editor: TiptapEditor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    label: 'Numbered List',
    description: '순서 있는 목록',
    icon: ListOrdered,
    command: (editor: TiptapEditor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    label: 'To-do List',
    description: '체크리스트',
    icon: ListTodo,
    command: (editor: TiptapEditor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    label: 'Blockquote',
    description: '인용',
    icon: Quote,
    command: (editor: TiptapEditor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    label: 'Code Block',
    description: '코드 블록',
    icon: Code2,
    command: (editor: TiptapEditor) => editor.chain().focus().toggleCodeBlock().run(),
  },
];

export const INSERT_ITEMS: MenuItem[] = [
  {
    label: 'Separator',
    description: '구분선',
    icon: Minus,
    command: (editor: TiptapEditor) => editor.chain().focus().setHorizontalRule().run(),
  },
];
