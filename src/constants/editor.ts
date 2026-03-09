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
  ImageIcon,
  Paperclip,
} from 'lucide-react';
import { MenuItem } from '@/types/editor';

export const STYLE_ITEMS: MenuItem[] = [
  {
    label: '텍스트',
    icon: Type,
    command: (editor: TiptapEditor) => editor.chain().focus().clearNodes().setParagraph().run(),
  },
  {
    label: '제목 1',
    description: '#',
    icon: Heading1,
    command: (editor: TiptapEditor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    label: '제목 2',
    description: '##',
    icon: Heading2,
    command: (editor: TiptapEditor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: '제목 3',
    description: '###',
    icon: Heading3,
    command: (editor: TiptapEditor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: '글머리 기호 목록',
    description: '-',
    icon: List,
    command: (editor: TiptapEditor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    label: '번호 매기기 목록',
    description: '1.',
    icon: ListOrdered,
    command: (editor: TiptapEditor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    label: '할 일 목록',
    description: '[]',
    icon: ListTodo,
    command: (editor: TiptapEditor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    label: '인용',
    description: '>',
    icon: Quote,
    command: (editor: TiptapEditor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    label: '코드',
    description: '```',
    icon: Code2,
    command: (editor: TiptapEditor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    label: '구분선',
    description: '---',
    icon: Minus,
    command: (editor: TiptapEditor) => editor.chain().focus().setHorizontalRule().run(),
  },
];

export function createMediaItems(
  openImagePicker: () => void,
  openFilePicker: () => void,
): MenuItem[] {
  return [
    {
      label: '이미지',
      icon: ImageIcon,
      command: () => openImagePicker(),
    },
    {
      label: '파일',
      icon: Paperclip,
      command: () => openFilePicker(),
    },
  ];
}
