import { Editor as TiptapEditor } from '@tiptap/core';
import { Type, Bold, Italic, Code2, Heading1, Heading2, Heading3 } from 'lucide-react';
import { MenuItem } from '@/types/editor';

export type BubbleActiveKey =
  | 'plainText'
  | 'bold'
  | 'italic'
  | 'code'
  | 'heading1'
  | 'heading2'
  | 'heading3';

export interface BubbleMenuItem extends MenuItem {
  key: BubbleActiveKey;
}

export const MARK_BUTTONS: BubbleMenuItem[] = [
  {
    key: 'plainText',
    label: '일반 텍스트',
    icon: Type,
    command: (e: TiptapEditor) => e.chain().focus().clearNodes().unsetAllMarks().run(),
  },
  {
    key: 'bold',
    label: '굵게',
    icon: Bold,
    command: (e: TiptapEditor) => e.chain().focus().toggleBold().run(),
  },
  {
    key: 'italic',
    label: '기울임',
    icon: Italic,
    command: (e: TiptapEditor) => e.chain().focus().toggleItalic().run(),
  },
  {
    key: 'code',
    label: '인라인 코드',
    icon: Code2,
    command: (e: TiptapEditor) => e.chain().focus().toggleCode().run(),
  },
];

export const HEADING_BUTTONS: BubbleMenuItem[] = [
  {
    key: 'heading1',
    label: '제목 1',
    icon: Heading1,
    command: (e: TiptapEditor) => e.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    key: 'heading2',
    label: '제목 2',
    icon: Heading2,
    command: (e: TiptapEditor) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    key: 'heading3',
    label: '제목 3',
    icon: Heading3,
    command: (e: TiptapEditor) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
];
