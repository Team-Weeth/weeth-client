import { Editor as TiptapEditor } from '@tiptap/core';

export interface MenuItem {
  label: string;
  description: string;
  icon: string;
  command: (editor: TiptapEditor) => void;
}
