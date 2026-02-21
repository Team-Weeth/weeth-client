import { Editor as TiptapEditor } from '@tiptap/core';
import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  label: string;
  description: string;
  icon: LucideIcon;
  command: (editor: TiptapEditor) => void;
}
