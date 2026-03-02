'use client';

import { BubbleMenu } from '@tiptap/react';
import { Editor as TiptapEditor } from '@tiptap/core';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { RefObject } from 'react';

const bubbleButtonVariants = cva('rounded px-200 py-100 typo-button2 transition-colors', {
  variants: {
    active: {
      true: 'bg-button-primary text-text-inverse',
      false: 'text-text-normal hover:bg-container-neutral-interaction',
    },
  },
  defaultVariants: { active: false },
});

interface BubbleMenuBarProps {
  editor: TiptapEditor;
  containerRef: RefObject<HTMLDivElement | null>;
}

export function BubbleMenuBar({ editor, containerRef }: BubbleMenuBarProps) {
  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        appendTo: () => containerRef.current ?? document.body,
      }}
      className="border-line bg-container-neutral flex items-center gap-100 rounded-lg border p-100 shadow-md"
    >
      <button
        type="button"
        aria-label="굵게"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
        className={cn(bubbleButtonVariants({ active: editor.isActive('bold') }), 'font-bold')}
      >
        B
      </button>
      <button
        type="button"
        aria-label="기울임"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleItalic().run();
        }}
        className={cn(bubbleButtonVariants({ active: editor.isActive('italic') }), 'italic')}
      >
        I
      </button>
      <button
        type="button"
        aria-label="인라인 코드"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleCode().run();
        }}
        className={cn(bubbleButtonVariants({ active: editor.isActive('code') }), 'font-mono')}
      >
        {'<>'}
      </button>
      <div className="bg-line mx-100 h-4 w-px" />
      <button
        type="button"
        aria-label="제목 1"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level: 1 }).run();
        }}
        className={cn(bubbleButtonVariants({ active: editor.isActive('heading', { level: 1 }) }))}
      >
        H1
      </button>
      <button
        type="button"
        aria-label="제목 2"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        }}
        className={cn(bubbleButtonVariants({ active: editor.isActive('heading', { level: 2 }) }))}
      >
        H2
      </button>
      <button
        type="button"
        aria-label="제목 3"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
        className={cn(bubbleButtonVariants({ active: editor.isActive('heading', { level: 3 }) }))}
      >
        H3
      </button>
    </BubbleMenu>
  );
}
